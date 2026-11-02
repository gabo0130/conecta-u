# Prompt para la sesión del frontend — Recomendaciones (RF11–RF13)

Pegar en la sesión del frontend (repo `C:\Proyectos\conecta-u`) **después** de terminar `prompt-frontend-iteracion-2.md` (análisis con IA). El backend ya implementó las recomendaciones.

---

Continúa la Iteración 2 del front de Conecta U. El backend (repo `C:\Proyectos\conecta-u-back`, **no lo toques**) ya implementó las recomendaciones de personas (RF11–RF13). Ya existe `/proyectos/[id]/analisis`; ahora reemplaza el estado "Próximamente" de `/proyectos/[id]/recomendaciones` por la pantalla real.

## Lee primero
- `CLAUDE.md`, `notes/reglas-frontend.md`.
- `notes/backend-iteracion-2.md`, sección **§12 → "Recomendaciones (RF11–RF13)"**: fórmula, rutas, cuerpos y errores exactos. Es la fuente de verdad; si el comportamiento real difiere, repórtalo al usuario con el caso exacto en vez de adaptarte en silencio.
- Lo ya hecho para el análisis (hooks, `RequiredProfileCard`, cliente HTTP con override de timeout y exclusión del banner "servidor despertando").

## Qué hacer
1. **Tipos y hooks** (patrón existente): `RecommendationsResponse`, `RecommendationItem`, `RecommendationDetail` y `MatchBreakdown` exactamente como §12. `useRecommendations(projectId)` carga con `GET` (siempre 200: perfiles con `recommendations: []` si aún no se generó; `generatedAt: null` ⇒ nunca generado) y expone `generate({ includeUnavailable })` (`POST`, usa timeout de 60 s como el análisis; un 409 trae su mensaje: "primero analiza el proyecto…"). `useRecommendationDetail(projectId, id)` para el panel RF13.
2. **`/proyectos/[id]/recomendaciones`** (LIDER dueño; ADMIN solo lectura sin el botón de generar):
   - Si el proyecto no tiene análisis (404 del análisis o estado BORRADOR): invitar a analizar, enlazando a `/proyectos/[id]/analisis`.
   - Selector/pestañas por perfil requerido (nombre, cantidad, prioridad) y botón **"Generar recomendaciones"** (estado de carga, deshabilitado mientras corre) con el interruptor **"Incluir no disponibles"** (se manda en el `POST`; también filtra la vista con `includeUnavailable`).
   - Lista ordenada por perfil: posición (`rank`), nombre, programa, tipo de persona, grupo de investigación, **barra de puntaje** (`score` 0–100), chips de disponibilidad y de **"tiene usuario / sin usuario"** (`hasUser`), y "N de M habilidades" (`matchedSkillCount/requiredSkillCount`). Muestra `generatedAt` ("Generado el …") y, si el líder edita/descarta perfiles después, un aviso para volver a generar (las recomendaciones no se recalculan solas).
   - Estados vacíos claros: perfil sin coincidencias, nadie disponible, aún no generado.
   - **Panel/modal "¿Por qué?" (RF13)** al abrir una persona: habilidades que coinciden (requerida vs. que tiene, meses, importancia), faltantes, experiencia relevante (`items`), disponibilidad (estado, horas que ofrece vs. horas requeridas), afinidad semántica (`semantic.similarity`; si es `null`, decir que no estuvo disponible) y los **pesos aplicados** (`breakdown.weights`) con el aporte de cada componente (`components`). Accesible (foco, `aria-*`, cierre con Esc).
   - Privacidad: el backend no envía correo ni teléfono; no los pidas ni muestres campos que no estén en §12. `hasUser: false` ⇒ la persona existe sin cuenta, no hay forma de contactarla desde la plataforma todavía (la convocatoria es de la Iteración 3: no la inventes).
3. **Integración**: en `/proyectos/[id]` agrega "Ver recomendaciones" cuando el proyecto está ANALIZADO; en `AdminProjectInfo`, el texto "colaboradores asociados (pendiente Iteración 2)" pasa a mostrar un enlace a las recomendaciones del proyecto para el ADMIN (solo lectura).
4. **Calidad**: pruebas de hooks y componentes (estados cargando/vacío/error, orden, filtro de no disponibles, panel de detalle con `semantic: null`, 409 al generar sin análisis), y que `tsc`, `lint` y `build` pasen. Verifica en el navegador con el backend local (`http://localhost:3001`): `laura.mendez@conectau.test` / `Test1234!` (solo desarrollo), proyecto "Reducción de desperdicio de alimentos (IoT)" (ya tiene análisis y recomendaciones generadas); ADMIN `admin@conectau.test`. Probar también el 409 con "SISGELAB — Sistema de gestión de laboratorios" (BORRADOR, sin análisis).
5. Actualiza `notes/estado-desarrollo.md` (y el README del front si lista rutas). No edites `notes/backend-iteracion-2.md`. Sin commits salvo que el usuario lo pida. Responde en español, conciso.

## Fuera de alcance
Convocatoria por correo (RF21–RF22), dashboard/reportes, cambios de backend.
