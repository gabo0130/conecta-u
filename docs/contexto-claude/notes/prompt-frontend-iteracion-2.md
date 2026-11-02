# Prompt para la sesión del frontend — Iteración 2 (análisis con IA)

Pegar tal cual en una sesión nueva abierta en `C:\Proyectos\conecta-u`.

---

Eres el desarrollador frontend de Conecta U (Next.js, repo `C:\Proyectos\conecta-u`). El backend (NestJS, repo `C:\Proyectos\conecta-u-back`) ya implementó el análisis de proyectos con IA de la Iteración 2 (RF8–RF10). Tu trabajo es adaptar el front a ese contrato. **No toques el backend.**

## Lee primero
1. `CLAUDE.md` y `notes/reglas-frontend.md` (arquitectura atómica, convenciones, qué no hacer). Síguelos.
2. `notes/backend-iteracion-2.md`, sobre todo **§12 "Contrato implementado"**: rutas, cuerpos, errores, tiempos. Es la fuente de verdad; si algo del front contradice §12, gana §12. Los endpoints de recomendaciones (RF11–RF13) **todavía no existen**.
3. El código actual: `src/apis/client.ts` y `shared-request.ts`, `src/apis/interfaces/projects.ts`, `src/modules/projects/*`, `src/components/organisms/SkillPicker`, `ProjectView`, `src/app/(protected)/proyectos/*` (incluidas las maquetas `analisis/page.tsx` y `recomendaciones/page.tsx`, que usan datos quemados).

## Qué hacer

### 1. Cliente HTTP (cambio de infraestructura, hazlo primero)
- El timeout global de axios es 15 s. `POST /projects/:id/analysis` es síncrono y con Gemini tarda 15–45 s: esa petición debe usar **timeout de 60 000 ms** (override por petición, sin subir el global).
- El interceptor de `apiClient` trata sin respuesta/timeout y los 502/503/504 como "servidor despertando" (`reportUnreachable`, banner global, reintento de `/health`). **Las peticiones de IA deben quedar excluidas**: el 503 de `POST …/analysis` significa "la IA falló", no "el servidor duerme". Implementa la exclusión con una opción explícita por petición (p. ej. un flag en la config de axios con su tipado), no comparando URLs a mano. Un timeout del navegador en esa petición tampoco activa el banner.
- Si `POST …/analysis` se corta por timeout sin respuesta, el análisis pudo terminar igual en el servidor: antes de mostrar error, haz un `GET /projects/:id/analysis` y, si ya hay un análisis nuevo, úsalo.
- Pruebas unitarias del interceptor para: 503 de IA no dispara el banner; 503 normal sí; timeout de IA no dispara el banner.

### 2. Tipos y hooks
- Tipos en `src/apis/interfaces/` (nuevo `analysis.ts` o dentro de `projects.ts`) con exactamente los DTO de §12: `ProjectAnalysis` (con `outdated` y `profiles`), `AnalysisSummary` + `meta` paginada, `RequiredProfile` (`source: "IA" | "MANUAL"`, `skills[].catalogued`), y los payloads de crear/editar perfil.
- Hooks siguiendo el patrón existente (`useProjects`, `shared-request`): `useProjectAnalysis(projectId)` (carga con GET; **404 = "aún sin análisis", no es error**; `analyze()` con estados idle/analizando/error y mensaje del 503/409/422 tal cual viene del backend), `useRequiredProfiles(projectId)` (crear, editar, descartar con `active:false`, y refrescar el análisis después) y, opcional, `useAnalysisHistory(projectId)`.

### 3. Rutas y pantallas
- Mover las maquetas a rutas por proyecto: **`/proyectos/[id]/analisis`** (real) y **`/proyectos/[id]/recomendaciones`** (solo un estado "Próximamente: las recomendaciones llegan en la siguiente entrega", sin llamar a ninguna API ni datos quemados). Elimina las rutas viejas `/proyectos/analisis` y `/proyectos/recomendaciones` y arregla los enlaces que las usen (dashboard, menú, `ProjectView`).
- `/proyectos/[id]/analisis` (LIDER dueño; ADMIN en solo lectura):
  - Sin análisis: explicación breve + botón **"Analizar con IA"**. Si faltan título/resumen/objetivos el backend responde 422: mostrar su mensaje.
  - Durante la petición: estado de carga claro que diga que puede tardar hasta un minuto, botón deshabilitado, sin dejar la pantalla congelada ni mostrar spinners infinitos si falla.
  - Con análisis: resumen, metadatos discretos (modelo, fecha), aviso **"El proyecto cambió desde el último análisis"** con botón "Volver a analizar" cuando `outdated` es true, y la lista de perfiles.
  - **`RequiredProfileCard`** (organismo/molécula según las reglas): nombre, cantidad, prioridad, horas semanales mínimas, etiqueta **IA / Manual**, descripción, **justificación** (RF10) bien visible, y las habilidades **separadas en técnicas (conocimientos + competencias) y blandas** reutilizando `groupBySoftSkill`, cada chip con su nivel mínimo e importancia; las `catalogued:false` en gris con la leyenda "no catalogada".
  - Acciones por perfil: **editar** y **descartar** (con confirmación). **"Agregar perfil"** abre un formulario (modal) con nombre, descripción, justificación, cantidad (1–10), prioridad, horas (opcional) y habilidades con nivel e importancia. Para elegir habilidades usa el `SkillPicker` pero **solo catálogo activo**: no ofrezcas "proponer habilidad nueva" aquí (el backend responde 404 con habilidades pendientes). Respeta los límites de §12 (1–8 habilidades, sin repetir).
  - Errores 403/404 de proyecto ajeno: el manejo habitual de la app.
  - Historial de análisis (opcional, compacto): fecha, estado (`ERROR` con su mensaje), modelo.
- `/proyectos/[id]` (detalle): según el estado del proyecto, el LIDER ve **"Analizar con IA"** (BORRADOR), **"Ver análisis"** (ANALIZADO) o un indicador de "Analizando…" (EN_ANALISIS); ambos llevan a `/proyectos/[id]/analisis`. Para el ADMIN, un enlace de solo lectura si el proyecto está ANALIZADO. El texto "colaboradores asociados (pendiente Iteración 2)" de `AdminProjectInfo` se queda como está: depende de las recomendaciones.

### 4. Calidad
- Pruebas (Jest/Testing Library, como las existentes) para hooks y componentes nuevos: estados de carga/error, 404 sin análisis, `outdated`, separación blandas/técnicas, "no catalogada", crear/editar/descartar perfil, y el cliente HTTP.
- Corre `npx tsc --noEmit`, `npm run lint` y `npm run build`, y deben pasar. Revisa también la accesibilidad básica (foco en el modal, etiquetas, roles).
- Verifica en el navegador (Browser pane) con el backend local en `http://localhost:3001` (`npm run start:dev` en `C:\Proyectos\conecta-u-back`). El backend está configurado con `AI_PROVIDER=gemini`; para no gastar IA al probar la UI puedes pedirle al usuario que lo cambie a `fake` (instantáneo y determinista). Cuentas del seed (solo desarrollo local): `laura.mendez@conectau.test` (LIDER), `admin@conectau.test` (ADMIN), contraseña `Test1234!`. Proyectos de Laura: "Reducción de desperdicio de alimentos (IoT)" y "Gestión de visitas empresariales" ya tienen un análisis real; "SISGELAB — Sistema de gestión de laboratorios" está en BORRADOR (sirve para probar el primer análisis; solo se permiten 5 análisis por proyecto al día). Prueba: analizar, ver el aviso de desactualizado tras editar el proyecto, agregar/editar/descartar un perfil manual, el 409 de análisis en curso, y que un fallo de la IA no active el banner de "servidor despertando".

### 5. Documentación y límites
- Actualiza `notes/estado-desarrollo.md` (y el README del front si lista rutas) con lo implementado y lo que queda pendiente (recomendaciones RF11–RF13).
- No edites `notes/backend-iteracion-2.md` (lo mantiene el backend). Si encuentras una discrepancia entre el contrato y el comportamiento real del backend, repórtala al usuario con el caso exacto en vez de adaptarte en silencio.
- No hagas commits salvo que el usuario lo pida. Responde en español, conciso.

## Fuera de alcance
Recomendaciones y su detalle "¿Por qué?" (RF11–RF13), panel de embeddings del ADMIN, cualquier cambio de backend.
