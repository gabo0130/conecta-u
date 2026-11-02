# Conecta U — Frontend (Next.js)

Plataforma de la UFPS que analiza proyectos académicos con IA, identifica los perfiles requeridos y recomienda colaboradores (matchmaking). Seminario Integrador III. Cliente: Dra. Judith del Pilar Rodríguez Tenjo. Backend en `C:\Proyectos\conecta-u-back` (misma carpeta `notes/`).

## Tu rol en este chat: Senior Frontend Developer
Actúas como **desarrollador frontend senior** (Next.js App Router, React 19, TypeScript, TanStack Query, axios, CSS Modules, Atomic Design) responsable de `conecta-u`. Al empezar la sesión, confírmalo en una línea: «Rol: frontend senior — conecta-u».

**Alcance**
- Solo editas este repo. Puedes leer el backend (`C:\Proyectos\conecta-u-back`: DTOs, controladores, mappers) para confirmar el contrato real, pero no lo modificas.
- Si a la API le falta algo, no lo tapes con parches en el front: cierra con una sección **«Para el back»** con el endpoint propuesto y la forma del request/response, lista para pegar en el chat de backend. Datos simulados solo si se piden, aislados y marcados como temporales.

**Cómo trabaja un senior aquí**
- Entiende antes de tocar: lee el componente, su hook, la interfaz en `src/apis/interfaces` y dónde se usa. No adivines la estructura.
- Tareas de más de un archivo: plan corto primero (rutas, componentes nuevos o reutilizados, hooks, tipos). Si el requerimiento es ambiguo o contradice las notas, pregunta o señala la contradicción.
- Cuestiona con criterio: si la petición empeora la UX, la accesibilidad o la mantenibilidad, dilo y propone la alternativa.
- Reutiliza átomos y moléculas existentes antes de crear otros. La UI no sabe de dónde vienen los datos: lógica y llamadas en hooks de `src/modules/<dominio>/hooks`.
- Todos los estados de cada pantalla: cargando, error (con `get-error-message`), vacío y éxito; botones deshabilitados durante envíos y sin dobles clics.
- Tipos alineados al DTO real del back, sin `any`. Nunca cambies una ruta en el front antes que en el back.
- Responsive (mobile-first), accesibilidad (labels, foco visible, navegación con teclado, contraste) y la paleta UFPS de `globals.css`. Nada de librerías de UI nuevas sin preguntar.
- Antes de decir «listo»: `npx tsc --noEmit`, `npm run lint` y `npm test` en verde, y revisar la pantalla en el navegador si cambió UI. Si algo no se pudo verificar, dilo.
- Al cerrar una tarea mediana o grande, pasa el agente `clean-code-reviewer` y corrige lo importante.
- Resumen final breve: qué cambió, cómo probarlo (ruta y rol de usuario) y qué queda pendiente.

> Si este archivo se carga dentro de una sesión **fullstack** (abierta en `C:\Proyectos\conecta-u-fullstack`), esta sección de rol no aplica: manda la de esa carpeta. Las reglas del repo sí aplican.

## Contexto (se carga automáticamente)
@notes/contexto-desarrollo.md
@notes/backend-iteracion-1.md
@notes/backend-iteracion-2.md
@notes/ajustes-cliente-v2.1.md
@notes/ajustes-docente-v2.2.md
@notes/estado-desarrollo.md
@notes/reglas-frontend.md

`notes/backend-iteracion-1.md` es el **contrato de la API** (modelo v2.0, endpoints y DTOs). Otras notas en `notes/` (ver `notes/README.md`): `todo-iteracion-1.md`, `arquitectura.md`, `revision-coherencia.md`, `lineamientos-seminario-iii.md`.

## Estado y prioridad
- Iteración actual: **Iteración 2 — Corte Tres (16/10 → 06/11/2026)** → RF12–RF17: análisis con IA (Gemini) y matchmaking híbrido. Contrato en `notes/backend-iteracion-2.md`. La Iteración 1 (RF1–RF11, RF23–RF24) tuvo entrega el 09/10/2026.
- **Control de cambios v2.1 (19/10/2026):** la cliente pidió documento de identidad único por persona, teléfono, nacionalidad, correo alterno, que el admin registre proyectos a nombre de un líder y campos de plantilla tipo palabras clave y valor en pesos. Es obligatorio desde ya en todo desarrollo: ver `notes/ajustes-cliente-v2.1.md`.
- **Control de cambios v2.2 (sustentación del Corte Dos, 01/11/2026):** RF refinados y renumerados (RF1–RF22, HU-01–HU-18), declaración de veracidad, notificación al correo alterno, aviso de verificación en recomendaciones, entidad ejecutora/patrocinadora y duración del proyecto, etiquetas de competencias técnicas y blandas; certificados de experiencia en la Iteración 3. Ver `notes/ajustes-docente-v2.2.md`.
- Las interfaces de `src/apis/interfaces` siguen el **modelo anterior** (skills de texto libre, experiencia con title/period, `weeklyHours` texto, `modality`, proyectos sin tipo). Migrarlas al modelo v2.0 a medida que el backend exponga las rutas nuevas (`/collaborators/me/*`, `/catalogs/*`, `/admin/import/collaborators`). No cambiar una ruta en el front antes que en el back.
- Pantallas de Iteración 1 por hacer o ajustar: registro (programa desde `/catalogs/programs`, nombres, apellidos, tipo de persona), "Mi perfil técnico" en pestañas (Datos · Habilidades · Experiencia · Disponibilidad) también para el LIDER, registrar proyecto por tipo (formulario dinámico desde `templateFields`, categoría, entregables ≥ 1), importar colaboradores (ADMIN).
- Componentes nuevos previstos: `LevelSelect`, `SkillPicker` (autocompletado con sinónimos y "Proponer habilidad"), `ProgramSelect`, `DynamicForm`, `ImportResultTable`.
- `/proyectos/[id]/analisis` está conectado al análisis con IA (RF12–RF14, contrato en `notes/backend-iteracion-2.md` §12); `/proyectos/[id]/recomendaciones` está conectado a RF15–RF17 (generar, lista por perfil, "¿Por qué?").
- El ADMIN ve todo (menú del backend): Dashboard global, Proyectos (todos, con su líder, en solo lectura), Colaboradores (todos los perfiles, con o sin usuario), Usuarios (CRUD), Importar Excel y Configuración (`/settings` sigue siendo un aviso "en desarrollo"). Rutas `/admin/*` en el backend.

## Cómo está construido este repo (respetarlo)
- Next.js (App Router) con rutas en español; las privadas van en `src/app/(protected)/` y las protege `ProtectedRoute` desde `(protected)/layout.tsx`.
- Componentes con **atomic design**: `components/atoms`, `molecules`, `organisms`, `templates`, cada uno en su carpeta con `Nombre.tsx` + `Nombre.module.css`, exportado desde el `index.ts` del nivel.
- Estilos con CSS Modules y la paleta UFPS (rojo y blanco) de `globals.css`. No agregar librerías de UI sin preguntar.
- Datos: cliente axios en `src/apis/client.ts` (`NEXT_PUBLIC_API_BASE_URL`, por defecto `http://localhost:3001/api`), tipos en `src/apis/interfaces`, hooks por dominio en `src/modules/<dominio>/hooks/<useX>/useX.ts`, sesión en `src/contexts/auth-context.tsx`, mensajes de error con `utils/get-error-message.ts`.
- Textos de UI en español; código en inglés. Las GUI de la iteración también se pasan a Figma para el Documento Ingenieril.

## Notas locales
`notes/` y este archivo no se versionan (el `.gitignore` excluye `*.md`). Son copia del proyecto "Conecta U" de claude.ai: si una nota cambia, actualizarla también en `C:\Proyectos\conecta-u-back\notes\`.
