/**
 * Carga global: un overlay que bloquea la pantalla mientras corre una acción, llamable desde
 * cualquier parte (componentes, hooks, utilidades). Se muestra en <LoadingHost /> (layout raíz).
 *
 *   await loading.run(saveProject(payload), "Guardando proyecto…");
 *
 *   const stop = loading.start("Importando colaboradores…");
 *   try { ... } finally { stop(); }
 *
 * Varias acciones a la vez se apilan: el overlay sigue visible hasta que termina la última y
 * muestra el mensaje de la más reciente.
 */

export type LoadingEntry = { id: number; message: string };

const DEFAULT_MESSAGE = "Cargando…";

let entries: LoadingEntry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function start(message: string = DEFAULT_MESSAGE) {
  const id = nextId++;
  entries = [...entries, { id, message }];
  emit();
  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    entries = entries.filter((entry) => entry.id !== id);
    emit();
  };
}

async function run<T>(task: Promise<T> | (() => Promise<T>), message?: string): Promise<T> {
  const stop = start(message);
  try {
    return await (typeof task === "function" ? task() : task);
  } finally {
    stop();
  }
}

export const loading = { start, run };

/* ---- Lectura del estado para <LoadingHost /> (useSyncExternalStore) ---- */

export function subscribeLoading(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Entrada más reciente (su mensaje es el que se muestra) o null si no hay nada cargando. */
export function getCurrentLoading(): LoadingEntry | null {
  return entries[entries.length - 1] ?? null;
}

export function getServerLoading(): LoadingEntry | null {
  return null;
}
