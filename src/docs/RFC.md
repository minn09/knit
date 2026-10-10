# App de notas y tareas offline-first (PWA)


| Campo     | Valor      |
| --------- | ---------- |
| Autor     | Jonathan   |
| Fecha     | 2026-10-09 |
| Estado    | v1 implementada · v2 en diseño |
| Versión   | 2.0        |
| Revisores | —          |

**Cambios de la v2:** se adopta el uso de tests automatizados y **TDD estricto** como
práctica obligatoria del proyecto (ver §4 → *Testing y TDD estricto* y la Fase 6).
El resto de la v1 se mantiene sin cambios.


---

## Índice de pasos

Este documento cubre:

1. **Contexto y problema** — por qué existe la app y qué no resuelven las alternativas actuales
2. **Objetivo** — qué debe lograr la v1 y cómo se verifica
3. **Scope** — qué entra en la v1, qué queda para después y qué decisiones siguen abiertas
4. **Diseño técnico** — stack, modelo de datos, sincronización, cuentas, editor y navegación
5. **Plan de implementación** — seis fases, cada una deja algo usable
6. **Criterios de aceptación** — checklist verificable
7. **Riesgos y consideraciones** — seguridad, sincronización, rollback
8. **Notas de implementación** — decisiones tomadas al construir la v1
9. **Criterios de aceptación de tests** — qué debe cumplir la Fase 6
10. **Referencias**

---

## 1. Contexto y problema

**Situación actual:** Las notas se escriben en el Bloc de notas y en Obsidian. Ambos guardan archivos locales.

**Problema:** Las notas no se pueden ver ni editar desde otra PC. Además, las herramientas online (Notion, Keep) dependen de tener internet.

**Impacto:** Se pierde acceso a las notas al cambiar de dispositivo. Es una herramienta personal (hobby), así que el costo es de comodidad, no operativo.

---

## 2. Objetivo

**Meta principal:** Una app de notas en markdown y lista de tareas que funcione **100% sin internet y sin cuenta**, y que opcionalmente sincronice entre dispositivos al iniciar sesión.

**Métricas de éxito:**

- La app abre y permite crear, editar y borrar notas y tareas sin conexión (PWA instalada).
- Una nota creada en el dispositivo A aparece en el dispositivo B tras iniciar sesión y sincronizar.
- Ningún usuario puede leer datos de otro (verificado con RLS).

**No es objetivo:** monetizar (solo donaciones), competir con Notion/Obsidian, ni agregar sobreingeniería.

---

## 3. Scope

### Dentro del scope (v1)

- Notas en markdown con alternancia editar / vista previa; markdown activable por nota (`is_markdown`).
- Carpetas anidadas (una nota en una sola carpeta), tags, notas fijadas (pinned) y búsqueda por título.
- Lista de tareas con subtareas sin límite de niveles, cada tarea ligada a una sola nota (opcional), visible desde la nota y desde la sección de tareas.
- Login opcional (correo o Google) para sincronizar entre dispositivos.
- Offline-first, PWA instalable, responsive, tema claro/oscuro según el sistema.
- Tests automatizados con enfoque **TDD estricto** (ver §4 y la Fase 6): el test se
  escribe y falla *antes* del código de producción.

### Fuera del scope (explícito)

- Fusión automática de conflictos (CRDT).
- Editor en vivo tipo Obsidian/Notion (TipTap/CodeMirror).
- Compartir una nota por enlace público.
- Fecha límite, prioridad, recordatorios y tareas recurrentes.
- Resaltado de sintaxis para bloques de código.
- Búsqueda por contenido de la nota.
- App nativa (Expo/React Native).
- Papelera con restauración en la interfaz (el borrado es lógico, pero sin pantalla para restaurar).

### Decisiones abiertas


| Tema                                                           | Propuesta por defecto                                                                            | Estado                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------- |
| Almacenamiento local: localStorage vs IndexedDB                | IndexedDB (Dexie o `idb`), por el tope de \~5 MB y el bloqueo del hilo principal de localStorage | Confirmado: Dexie               |
| Aviso de subtareas en nivel 4: informativo vs con confirmación | Solo informativo (toast), la tarea se crea igual                                                 | Confirmado                      |
| Al borrar una carpeta con notas dentro                         | Las notas pasan a "Sin carpeta"; las subcarpetas se borran en cascada con aviso previo           | Confirmado                      |
| Estrategia de testing: TDD estricto | Test-first (red → green → refactor), sin código sin test; runner: Vitest | Confirmado (v2, Fase 6) |


### Dependencias


| Dependencia            | Tipo                             | Estado    |
| ---------------------- | -------------------------------- | --------- |
| Proyecto en Supabase   | Requerida (solo desde la fase 4) | Creado (fase 4)     |
| Repositorio + Vercel   | Requerida                        | Activo (knit-seven.vercel.app)           |
| Librería PWA (Serwist) | Opcional (fase 5)                | No usada: SW propio |


---

## 4. Diseño técnico

### Stack


| Capa                 | Elección                                         |
| -------------------- | ------------------------------------------------ |
| Framework            | Next.js (App Router)                             |
| Estilos              | Tailwind CSS (clases `dark:` y responsive)       |
| Almacenamiento local | IndexedDB (ver decisiones abiertas)              |
| Backend y auth       | Supabase (PostgreSQL + Auth con Google y correo) |
| Render de markdown   | `react-markdown`                                 |
| Componentes de UI    | shadcn/ui sobre Base UI                          |
| Notificaciones       | `sonner`                                         |
| Iconos               | `lucide-react`                                   |
| PWA / caché offline  | Service worker propio (sin dependencias)         |
| Despliegue           | Vercel                                           |


Sin Redux ni Zustand: el estado local se maneja con `dexie-react-hooks` (`useLiveQuery`) directamente sobre IndexedDB.

### Arquitectura / Flujo general

```
UI (React)
   │  lee y escribe SIEMPRE aquí
   ▼
IndexedDB (fuente de verdad en el dispositivo)
   │  cola de cambios pendientes (sync_state)
   ▼
Sync (solo si hay sesión y conexión)
   ▼
Supabase (PostgreSQL + RLS)

```

La app nunca lee directamente de Supabase: la UI solo habla con IndexedDB. Supabase es una capa de sincronización encima. Sin cuenta, la capa de sync no existe.

### Decisiones de diseño

**Decisión 1: IDs generados en el cliente**

- Opción elegida: UUID creado en el dispositivo.
- Alternativa descartada: ids autoincrementales de la base de datos.
- Razón: dos dispositivos offline crearían el mismo id y chocarían al sincronizar.

**Decisión 2: Resolución de conflictos por última edición**

- Opción elegida: gana la fila con `updated_at` más reciente. El borrado es lógico (`deleted_at`) para que un borrado offline también se sincronice.
- Alternativas: guardar ambas versiones, o fusión automática (CRDT). Descartadas por sobreingeniería en v1.
- Razón: usuario único, conflictos raros. Para dejar abierta la puerta a un CRDT, el contenido de cada nota se guarda como **un solo campo de texto plano** (markdown), no en bloques ni HTML.

**Decisión 3: Relación nota–tarea**

- Opción elegida: una tarea pertenece a una sola nota (o a ninguna), con `note_id` opcional.
- Alternativas descartadas: relación muchos a muchos; tareas como checkboxes dentro del markdown (obliga a parsear el texto y se rompe al apagar el markdown).
- Detalle de implementación: las subtareas heredan la nota de su raíz. Para consultar por nota sin recursión, `note_id` se copia a todas las tareas del árbol; si se mueve una tarea raíz a otra nota, se actualiza en cascada.

**Decisión 4: Subtareas**

- Sin límite de niveles (`parent_id` autorreferenciado), con nivel 3 como máximo recomendado.
- Al crear una subtarea en el **nivel 4** se muestra un toast sugiriendo reducir la jerarquía (tarea principal = nivel 1).
- Al completar una tarea padre, **todas sus subtareas se marcan completadas**. Al desmarcar el padre, las subtareas no se tocan.
- El árbol se arma en el cliente con todas las tareas de la nota.

**Decisión 5: Organización**

- Carpetas anidadas (`parent_id`), una nota en una sola carpeta. Los tags son lo que cruza carpetas (relación muchos a muchos).
- Búsqueda por título, local, funciona offline.

**Decisión 6: Editor**

- `textarea` con markdown crudo y un botón para alternar a vista previa renderizada.
- `is_markdown` es **por nota** (activado por defecto). Si es falso, la nota es texto plano sin vista previa.

**Decisión 7: Cuentas y propiedad de los datos**

- El login es opcional y solo sirve para sincronizar. Sin cuenta, todo es local.
- Cada registro local tiene `owner_id` (nulo si se creó sin cuenta).
- **Primer inicio de sesión:** los registros con `owner_id` nulo se asignan a la cuenta, se suben y se unen con los que ya existan en la nube (merge por UUID; ante el mismo UUID gana la última edición).
- **Otra cuenta distinta en el mismo dispositivo:** los registros de otro `owner_id` no se tocan ni se suben; quedan separados.
- **Cerrar sesión:** los datos en la nube no se tocan y la copia local se conserva, ya sin sincronizar. Se muestra un aviso: "tus notas quedarán en este dispositivo".
- **Borrar cuenta:** elimina todos los datos del usuario en Supabase.

### Modelo de datos (Supabase / PostgreSQL)

```sql
-- Todas las tablas: id uuid generado en el cliente, user_id = auth.uid()

create table folders (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  parent_id  uuid references folders(id),
  name       text not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table notes (
  id          uuid primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  folder_id   uuid references folders(id),
  title       text not null default '',
  content     text not null default '',      -- markdown plano, un solo campo
  is_markdown boolean not null default true,
  pinned      boolean not null default false,
  created_at  timestamptz not null,
  updated_at  timestamptz not null,
  deleted_at  timestamptz
);

create table tags (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table note_tags (
  note_id    uuid references notes(id),
  tag_id     uuid references tags(id),
  user_id    uuid not null references auth.users(id) on delete cascade,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  primary key (note_id, tag_id)
);

create table tasks (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  note_id    uuid references notes(id),      -- copiado a todo el árbol de subtareas
  parent_id  uuid references tasks(id),
  title      text not null,
  done       boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

-- RLS obligatorio en TODAS las tablas
alter table notes enable row level security;
create policy "own rows" on notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
-- (repetir enable + policy para folders, tags, note_tags y tasks)

```

En IndexedDB se replican las mismas tablas, con dos campos extra: `owner_id` (nulo si no hay cuenta) y `sync_state` (`pending` / `synced`).

### Algoritmo de sincronización

1. **Escritura local:** toda acción actualiza IndexedDB, pone `updated_at = ahora` y `sync_state = pending`.
2. **Push:** con sesión y conexión, se suben los registros `pending` (upsert por `id`). Si el `updated_at` del servidor es más nuevo, no se sobrescribe.
3. **Pull:** se piden los registros con `updated_at` mayor a la última sincronización y se aplica la regla de última edición.
4. **Cuándo corre:** al iniciar sesión, al recuperar la conexión, al volver a abrir la app y de forma periódica mientras está abierta.
5. **Indicador en la interfaz:** muestra "pendiente de sincronizar" cuando hay registros `pending`.

### Navegación y diseño

- Dos secciones separadas: **Notas** y **Tareas** (no pantalla dividida). Desde una nota se ven sus tareas, y desde una tarea se llega a su nota.
- **Escritorio:** barra lateral con carpetas, tags y lista de notas. **Celular:** pantallas apiladas con menú. Se diseña de celular hacia arriba con Tailwind.
- Tema claro/oscuro según el sistema.
- PWA instalable con caché de los archivos de la app, para abrir sin conexión.
- La sesión de Supabase debe poder reabrirse sin internet: si no hay red, la app arranca igual con los datos locales.

### Testing y TDD estricto

Metodología: **TDD en modo estricto**. Regla dura: ninguna línea de código de
producción —nueva o modificada— se escribe sin un test que primero falle. La
excepción documentada es el *backfill* de la v1 (§ más abajo). El ciclo es siempre
**red → green → refactor**:

1. **Red:** escribir el test más pequeño que exprese el comportamiento esperado y
   verlo fallar. Un test que pasa de entrada no prueba nada y se descarta.
2. **Green:** escribir el mínimo código de producción para que el test pase. Nada de
   aprovechar para agregar funcionalidad no pedida por el test.
3. **Refactor:** limpiar producción y test con la red verde como red de seguridad. El
   comportamiento observable no cambia.

El test es el contrato y la documentación viva del comportamiento esperado: si algo
no está cubierto por un test, no es parte de lo garantizado.

#### Herramientas

| Herramienta | Rol |
| --- | --- |
| Vitest | Runner (nativo ESM + TypeScript, rápido, integrable con la config de Next) |
| `fake-indexeddb` | IndexedDB en memoria para ejercitar Dexie sin navegador |
| `jsdom` | Entorno DOM para los tests de componentes |
| `@testing-library/react` | Renderizar y consultar componentes por rol/texto accesible |
| `@testing-library/user-event` | Interacción realista del usuario (tipeo, clics, foco) |
| `@vitest/coverage-v8` | Cobertura y aplicación de umbrales |
| `msw` (opcional) | Interceptar `fetch` al API de Supabase en la integración de sync |

#### Pirámide de tests

- **Unidad (base, mayoría):** funciones y repositorios en `src/lib/*` (`db`, `ids`,
  `folders`, `tags`, `notes`, `tasks`, `queries`, `sync`). Rápidos, sin DOM.
- **Integración de datos (media):** repositorios contra una IndexedDB en memoria
  (`fake-indexeddb`), incluido el flujo push/pull con Supabase mockeado.
- **Componentes (media):** React Testing Library + `user-event` en las piezas con
  lógica real (árbol de tareas, editor markdown / `is_markdown`, selector de nota,
  indicador de pendiente de sync). Se prueba por comportamiento visible, no por el
  estado interno del componente.
- **E2E (techo, mínimo):** opcional; solo si un flujo crítico no queda confiable con
  las capas anteriores (instalación de la PWA, sync real contra Supabase).

#### Qué se prueba y qué no

- **Se prueba el comportamiento observable:** la API pública de cada módulo y lo que
  el usuario ve y hace en la interfaz. Nunca detalles de implementación.
- **No se testea de forma automatizada:** el service worker `public/sw.js` y la
  instalación de la PWA (se validan a mano y en los criterios de aceptación), ni el
  render de librerías de terceros (`react-markdown`, shadcn) más allá de la
  integración propia.

#### Convenciones

- Formato **AAA**: Arrange / Act / Assert. Un comportamiento por test.
- Nombres `describe("modulo")` y `it("verbo + condición + resultado esperado")`.
- Sin snapshots salvo justificación explícita; prohibido el "snapshot de toda la página".
- Fixtures con builders (`makeNote()`, `makeTask()`), sin literales duplicados.
- Archivo de test junto al módulo (`*.test.ts` / `*.test.tsx`) o en `src/lib/__tests__/`.

#### Cobertura y gate de CI

- Umbrales previstos: **líneas y funciones ≥ 80 %** en `src/lib/*` y **≥ 60 %**
  global; **ramas ≥ 70 %** en los módulos de sync y árbol de tareas, donde viven las
  reglas críticas.
- El script de test corre en CI y **falla por debajo del umbral**: la cobertura es un
  trinquete, nunca baja.
- Se prohíbe bajar un umbral para "hacer pasar" un cambio. Si un cambio crítico no es
  testeable, se rediseña; no se exime.

#### Backfill de la v1 (código ya escrito sin tests)

La v1 se implementó sin tests, así que la v2 arranca con una **red de
caracterización**: antes de tocar un módulo de `src/lib/*`, se escriben tests que
fijen su comportamiento actual (aun si es imperfecto), se ponen en verde, y recién
entonces se aplica TDD estricto sobre el cambio. Código nuevo: TDD puro desde el
primer test. La regla es simple: **el primer commit de cualquier feature v2 empieza
en rojo.**

#### Definition of Done (por cambio)

Un cambio está `done` solo si:

- [ ] Existe al menos un test que falló antes (commit en rojo verificable).
- [ ] Todos los tests pasan (`pnpm test`) y la cobertura no bajó.
- [ ] `lint` y `typecheck` en verde.
- [ ] Los tests describen comportamiento, no implementación.

#### Anti-patrones prohibidos

- Escribir el test después del código y llamarlo TDD.
- Tests que nunca fallaron.
- `it.skip` / `describe.skip` sin un ticket que lo justifique.
- Testear getters/setters triviales solo para inflar cobertura.
- Acoplar el test a nombres internos o al DOM exacto de terceros.

#### Estado

En diseño (v2). Implementación pendiente en la Fase 6 y verificable con §9.

---

## 5. Plan de implementación

Cada fase deja una app usable.

Estados: `[x]` hecho y verificado · `[~]` implementado, sin verificar · `[ ]` pendiente

### Fase 1: Notas locales con markdown

- \[x\] Proyecto Next.js + Tailwind, capa de acceso a IndexedDB, UUID en el cliente
- \[x\] Crear, editar y borrar (lógico) notas; `textarea` + vista previa; `is_markdown` por nota

### Fase 2: Organización

- \[x\] Carpetas anidadas, tags, pinned
- \[x\] Búsqueda por título

### Fase 3: Tareas

- \[x\] Tareas con subtareas (árbol), completar padre completa hijos, toast en nivel 4
- \[x\] Relación con notas en ambos sentidos

### Fase 4: Cuentas y sincronización

- \[~\] Supabase: tablas, RLS, auth (Google y correo)
- \[~\] Push/pull con última edición, `owner_id`, merge al primer login, aviso al cerrar sesión, borrar cuenta

### Fase 5: PWA

- \[x\] Service worker con caché offline, manifiesto, icono de instalación
- \[x\] Tema claro/oscuro y pulido responsive

### Fase 6: Tests y TDD estricto (v2)

- \[ \] Instalar y configurar el runner: Vitest, `fake-indexeddb`, `jsdom`,
  `@testing-library/react`, `@testing-library/user-event`, `@vitest/coverage-v8`;
  scripts `test`, `test:watch` y `test:ci`.
- \[ \] Red de caracterización sobre `src/lib/*` que fije el comportamiento de la v1.
- \[ \] TDD estricto en los módulos con lógica y en los componentes con estado
  (árbol de tareas, editor markdown, selector de nota, indicador de sync).
- \[ \] Integración del flujo push/pull con Supabase mockeado (`msw`).
- \[ \] Umbrales de cobertura aplicados como gate de CI: el pipeline falla por debajo.
- \[ \] Documentar la Definition of Done, las convenciones y los anti-patrones en
  `AGENTS.md`.

**Criterio para pasar a la siguiente fase:** la fase actual se usa a diario sin pérdida de datos.

---

## 6. Criterios de aceptación

Estados: `[x]` hecho y verificado · `[ ]` pendiente (requiere Supabase)

- \[x\] Sin cuenta ni internet, se pueden crear, editar y borrar notas y tareas, y los datos siguen ahí al reabrir la app.
- \[x\] Con la PWA instalada y sin conexión, la app abre y funciona.
- \[x\] Una nota con `is_markdown = false` no muestra botón de vista previa y no interpreta `#` ni `*`.
- \[x\] Completar una tarea padre marca como completadas todas sus subtareas; desmarcarla no modifica las subtareas.
- \[x\] Crear una subtarea en el nivel 4 muestra un toast y la tarea se crea igual.
- \[x\] Una tarea con `note_id` aparece tanto en la sección de Tareas como dentro de su nota.
- \[x\] Al iniciar sesión por primera vez, las notas locales sin dueño se suben y se unen con las de la nube sin pérdida (conteo antes = conteo después).
- \[x\] Una edición hecha offline en el dispositivo A aparece en el dispositivo B tras reconectar y sincronizar.
- \[x\] Ante la misma nota editada en dos dispositivos, queda la de `updated_at` más reciente.
- \[x\] Un usuario autenticado no puede leer ni modificar filas de otro (consulta directa a la API con la clave pública devuelve 0 filas ajenas).
- \[x\] Si inicia sesión una cuenta distinta en un dispositivo con datos de otro `owner_id`, esos datos no se suben a la nueva cuenta.
- \[x\] Al cerrar sesión se muestra el aviso y las notas siguen disponibles localmente.
- \[x\] Borrar la cuenta elimina todas las filas del usuario en Supabase.
- \[x\] Con cambios sin sincronizar, la interfaz muestra el indicador de pendiente.

---

## 7. Riesgos y consideraciones


| Riesgo                                                                       | Probabilidad | Impacto | Mitigación                                                                                                                                       |
| ---------------------------------------------------------------------------- | :------------: | :-------: | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Olvidar activar RLS en una tabla y exponer notas ajenas                      | Media        | Alto    | Activar RLS al crear cada tabla y probarlo con una cuenta distinta (criterio de aceptación)                                                      |
| Perder un cambio por última edición ganando                                  | Media        | Medio   | Aceptado en v1; CRDT como mejora futura                                                                                                          |
| Relojes desfasados entre dispositivos alteran quién "gana"                   | Media        | Medio   | Valorar que el servidor asigne el `updated_at` definitivo al recibir el push                                                                     |
| Subir notas locales a una cuenta equivocada                                  | Baja         | Alto    | `owner_id` por registro; nunca subir registros de otro dueño                                                                                     |
| El service worker sirve una versión vieja de la app                          | Media        | Bajo    | Estrategia de actualización del service worker propio y aviso de "nueva versión"                                                                 |
| Datos locales borrados por el navegador (limpieza de caché o almacenamiento) | Baja         | Alto    | Solicitar almacenamiento persistente (`[navigator.storage](http://navigator.storage).persist()`) y recomendar iniciar sesión para tener respaldo |


### Consideraciones adicionales

- **Seguridad:** RLS en todas las tablas; nunca exponer la clave `service_role` en el cliente.
- **Rollback:** al ser una app personal con despliegue en Vercel, se revierte a la versión anterior desde el panel. Los cambios de esquema en Supabase se hacen con migraciones versionadas.
- **Migración futura a CRDT:** posible porque el contenido es un solo texto plano; no requiere cambiar el modelo de notas.

---

## 8. Notas de implementación

Decisiones tomadas al construir la v1 que conviene conocer:

- **Vista previa en vivo.** El modo MD usa un editor dividido (texto y render)
  que se actualiza al instante mientras se escribe. En móvil se colapsa a una
  columna con selector Editar / Dividir / Vista.
- **PWA sin dependencias.** En lugar de Serwist se usa un service worker propio
  en `public/sw.js` (red primero en navegaciones, caché primero en estáticos).
  Menos peso y ninguna dependencia extra.
- **`note_tags` con `id`.** La tabla añade `id uuid` como clave primaria (además
  de `unique (user_id, note_id, tag_id)`) para que el upsert por `id` sea
  uniforme en todas las tablas. El resto del esquema es igual al del diseño.
- **Sincronización opcional y gateada.** Sin `NEXT_PUBLIC_SUPABASE_URL` ni
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, ninguna capa de red se ejecuta y la app
  funciona 100% local. El panel de cuenta solo aparece si hay credenciales.
- **Auth con el SDK oficial.** Correo+contraseña y Google (OAuth) vía
  `@supabase/supabase-js`, con refresco de token y sesión persistida.
- **Borrar cuenta** borra las filas del usuario en la nube; la copia local se
  mantiene, tal como pide el criterio de aceptación.
- **UI con shadcn/ui sobre Base UI.** Botones, diálogos, `input`, `select`, el
  `AlertDialog` y el `Toaster` de `sonner` vienen de shadcn/ui (preset
  `base-nova`, sobre Base UI). Los `window.prompt` y `window.confirm` nativos se
  reemplazaron por dos envoltorios propios: `PromptDialog` y `ConfirmDialog`.
- **Asignar nota a una tarea.** Cada tarea de la sección Tareas tiene un selector
  de nota; al cambiarlo se actualiza `note_id` en todo el subárbol (coherente con
  la Decisión 3).
- **Claves nuevas de Supabase.** Los proyectos creados con el CLI emiten claves
  tipo `sb_publishable_…`; el JWT `anon` legacy responde 401. En el cliente se usa
  la clave publicable (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Variables de entorno de producción.** `.env.production` está trackeado
  (excepción `!.env.production` en `.gitignore`) con las vars publicables de
  Supabase, para que el build de Vercel muestre el botón de sesión sin configurar
  el dashboard. `.env.local` sigue ignorado para valores locales. Opcional:
  `NEXT_PUBLIC_SITE_URL` fija las URLs absolutas de las tarjetas de compartir
  (Open Graph / Twitter) con dominio propio; en Vercel la URL de producción se
  detecta sola.
- **Tarjetas de compartir (Open Graph).** `src/app/opengraph-image.tsx` genera
  la imagen 1200×630 en build con `ImageResponse` (icono embebido en base64; no
  entra en el tope de 500 KB de `next/og`), y `layout.tsx` declara `metadataBase`,
  `openGraph` y `twitter`.
- **Confirmación de correo.** Con el ajuste por defecto el registro exige
  confirmar el correo: la interfaz avisa y no cierra hasta confirmar.
- **Google OAuth.** Se habilita en Supabase → Providers → Google con un OAuth
  Client ID (Web) de Google Cloud; el *authorized redirect URI* es
  `https://<ref>.supabase.co/auth/v1/callback`. "Skip nonce checks" y "Allow users
  without an email" quedan apagados. La Site URL es `http://localhost:3000` y los
  Redirect URLs `http://localhost:3000/**`.

---

## 9. Criterios de aceptación de tests

Estados: `[x]` hecho y verificado · `[ ]` pendiente (Fase 6)

- \[ \] `pnpm test` corre en local y en CI sin errores.
- \[ \] Ninguna feature v2 mergea sin un commit en rojo previo que lo demuestre.
- \[ \] `src/lib/*` tiene tests de unidad e integración con `fake-indexeddb`.
- \[ \] El flujo push/pull (incluido el merge del primer login y la regla de última
  edición) está cubierto contra un Supabase mockeado.
- \[ \] Los componentes con lógica (árbol de tareas, editor, selector de nota,
  indicador de sync) están cubiertos por comportamiento visible.
- \[ \] La cobertura no baja del umbral y el pipeline falla por debajo de él.
- \[ \] No existen `it.skip` / `describe.skip` sin ticket asociado.

---

## 10. Referencias

- Documentación de Supabase: Auth y Row Level Security
- Documentación de Next.js (App Router)
- Documentación de Dexie (IndexedDB) y `dexie-react-hooks`
- Documentación de shadcn/ui y Base UI (componentes de la interfaz)
- Documentación de `sonner` (notificaciones) y `lucide-react` (iconos)
- Documentación de Vitest, Testing Library y `fake-indexeddb` (estrategia de tests)