import { API_BASE_URL } from "@/apis/client-config";

/**
 * Estado del backend. Está desplegado en un plan gratuito que se apaga cuando no se usa y tarda
 * hasta ~5 minutos en arrancar con la primera petición. Al entrar a la app se consulta /health:
 * si tarda o falla, se muestra un aviso y se reintenta solo hasta que responda (o hasta MAX_WAIT_MS).
 *
 *   checkService()        al montar la app (lo hace <ServiceStatusHost />)
 *   reportUnreachable()   cuando cualquier petición falla por red/timeout (lo hace apiClient)
 *   retryNow()            botón "Reintentar ahora"
 *   diagnose()            botón de diagnóstico: mide la respuesta y, si falla, despierta el servidor
 */

export type ServiceStatus = "idle" | "checking" | "waking" | "online" | "offline";

export type ServiceState = {
  status: ServiceStatus;
  /** Cuándo empezó a esperar que el servidor arranque (para mostrar el tiempo transcurrido). */
  wakingSince: number | null;
  /** Consultas a /health en el episodio actual (se reinicia cada vez que empieza una espera). */
  attempts: number;
  lastLatencyMs: number | null;
  lastCheckedAt: number | null;
  /** true si el servidor estuvo caído en esta visita: al volver se ofrece recargar la página. */
  recovered: boolean;
};

export type PingResult = { ok: true; latencyMs: number } | { ok: false; latencyMs: number; reason: string };

const ATTEMPT_TIMEOUT_MS = 12000;
const SLOW_THRESHOLD_MS = 4000;
const MAX_WAIT_MS = 6 * 60 * 1000;
const RETRY_DELAYS_MS = [3000, 5000, 8000, 10000];

let state: ServiceState = {
  status: "idle",
  wakingSince: null,
  attempts: 0,
  lastLatencyMs: null,
  lastCheckedAt: null,
  recovered: false,
};
const listeners = new Set<() => void>();
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<PingResult> | null = null;

function setState(patch: Partial<ServiceState>) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

/** AbortSignal.timeout con respaldo para navegadores que no lo tienen. */
function timeoutSignal(ms: number) {
  if (typeof AbortSignal.timeout === "function") return AbortSignal.timeout(ms);
  const controller = new AbortController();
  setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), ms);
  return controller.signal;
}

export async function pingHealth(): Promise<PingResult> {
  const started = performance.now();
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      cache: "no-store",
      signal: timeoutSignal(ATTEMPT_TIMEOUT_MS),
    });
    const latencyMs = Math.round(performance.now() - started);
    if (!response.ok) return { ok: false, latencyMs, reason: `El servidor respondió ${response.status}.` };
    const body = (await response.json().catch(() => null)) as { status?: string } | null;
    return body?.status === "ok"
      ? { ok: true, latencyMs }
      : { ok: false, latencyMs, reason: "Respuesta inesperada del servidor." };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - started);
    const timedOut = err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError");
    return { ok: false, latencyMs, reason: timedOut ? "El servidor no respondió a tiempo." : "No hay conexión con el servidor." };
  }
}

/** Una consulta a la vez: si ya hay una en curso, se reutiliza. */
function ping() {
  inFlight ??= pingHealth().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

function clearRetry() {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
}

function startWaking() {
  if (state.status === "waking") return;
  // Cada espera empieza de cero: el tiempo, el contador de intentos y el retraso entre reintentos.
  setState({ status: "waking", wakingSince: Date.now(), attempts: 0 });
}

function handleResult(result: PingResult) {
  const measured = { lastLatencyMs: result.latencyMs, lastCheckedAt: Date.now() };

  if (result.ok) {
    clearRetry();
    const wasDown = state.status === "waking" || state.status === "offline";
    setState({
      ...measured,
      status: "online",
      wakingSince: null,
      attempts: state.attempts + 1,
      recovered: wasDown || state.recovered,
    });
    return;
  }

  startWaking();
  setState({ ...measured, attempts: state.attempts + 1 });
  const waited = Date.now() - (state.wakingSince ?? Date.now());
  if (waited >= MAX_WAIT_MS) {
    clearRetry();
    setState({ status: "offline" });
    return;
  }
  scheduleRetry();
}

function scheduleRetry() {
  clearRetry();
  const delay = RETRY_DELAYS_MS[Math.min(state.attempts - 1, RETRY_DELAYS_MS.length - 1)] ?? 10000;
  retryTimer = setTimeout(() => void attempt(), delay);
}

async function attempt() {
  // Si la consulta tarda, el aviso aparece antes de que termine (el servidor puede estar arrancando).
  const slowTimer = setTimeout(startWaking, SLOW_THRESHOLD_MS);
  const result = await ping();
  clearTimeout(slowTimer);
  handleResult(result);
  return result;
}

export function checkService() {
  if (state.status !== "idle") return;
  setState({ status: "checking" });
  void attempt();
}

export function reportUnreachable() {
  if (state.status === "waking" || state.status === "checking") return;
  startWaking();
  void attempt();
}

export function retryNow() {
  clearRetry();
  if (state.status === "offline") setState({ status: "waking", wakingSince: Date.now() });
  void attempt();
}

export async function diagnose() {
  clearRetry();
  return attempt();
}

/** Oculta el aviso de "servidor disponible". */
export function dismissRecovered() {
  setState({ recovered: false });
}

/* ---- Lectura del estado (useSyncExternalStore) ---- */

export function subscribeServiceStatus(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getServiceState() {
  return state;
}

const SERVER_STATE: ServiceState = { ...state };
export function getServerServiceState() {
  return SERVER_STATE;
}
