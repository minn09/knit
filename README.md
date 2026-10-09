# Knit

> A fast, offline-first notebook. Markdown notes and a task list that live on your device — and sync across them when you want.

Knit works with no account and no connection. Open it, write, close it; your notes are already saved. Sign in only if you want the same notebook on every device.

## What it does

- **Markdown when you want it.** Write in Markdown with a live preview that updates as you type, or turn it off and use the note as plain text.
- **Organize without friction.** Nested folders, tags, pinned notes, and title search — all available offline.
- **Tasks that stay connected.** A task list with unlimited subtasks. Every task can belong to a note, and you can reach it from either side.
- **Works without internet.** Notes are stored in your browser's IndexedDB. Install Knit as a PWA and keep writing when the network drops.
- **Sync only if you ask.** No account means everything stays local. Sign in and your notes follow you to your other devices.

## How it works

The UI never talks to a server directly. It reads and writes to **IndexedDB**, which is the source of truth on each device. When a session exists and there is a connection, a background sync pushes pending changes to **Supabase** and pulls what changed elsewhere. Last write wins, and deletes are soft so an offline delete propagates too.

```
UI → IndexedDB (source of truth) → Sync (optional) → Supabase (PostgreSQL + RLS)
```

Without Supabase credentials, the sync layer is simply absent and the app behaves as a purely local tool.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Local storage | [IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API) via [Dexie](https://dexie.org/) |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) |
| UI components | [shadcn/ui](https://ui.shadcn.com/) on [Base UI](https://base-ui.com/) |
| Icons | [lucide-react](https://lucide.dev/) |
| Toasts | [sonner](https://sonner.emilkowal.ski/) |
| Backend & auth | [Supabase](https://supabase.com/) (PostgreSQL + Auth) |
| Offline / PWA | Hand-rolled service worker |
| Deploy | [Vercel](https://vercel.com/) |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- [pnpm](https://pnpm.io/)

### Run it locally

```bash
git clone https://github.com/minn09/knit.git
cd knit
pnpm install
pnpm dev
```

Open http://localhost:3000. That is it — no configuration is required to use Knit locally.

### Enable sync (optional)

1. Create a project at [Supabase](https://supabase.com/).
2. Run the SQL in `supabase/migrations/0001_init.sql` in the Supabase SQL editor. It creates the tables and turns on Row Level Security for every one of them.
3. Copy `.env.example` to `.env.local` and fill in your values:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
   ```

   > New Supabase projects issue a **publishable key** (`sb_publishable_…`). Use it here — the legacy `anon` JWT returns `401 Invalid API key`.

4. In Supabase → **Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` and add `http://localhost:3000/**` to the Redirect URLs.
5. Email + password works out of the box. With the default "Confirm email" enabled, the address must be confirmed before signing in; turn it off under **Providers → Email** to sign in immediately.
6. Google sign-in: create a Google Cloud **OAuth 2.0 Client ID** (Web), add `https://<project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI, then enable **Providers → Google** in Supabase with that Client ID and secret. Leave "Skip nonce checks" and "Allow users without an email" off.
7. Restart the dev server. A sign-in button now appears, and Knit starts syncing.

Without these variables, Knit stays fully local.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Lint and check formatting with [Biome](https://biomejs.dev/) |
| `pnpm format` | Format the codebase with Biome |

## Project structure

```
src/
├── app/                 # Routes: landing, notes, tasks, changelog
│   ├── notas/           # Notes screen
│   └── tareas/          # Tasks screen
├── assets/              # Mascot images (Ovi)
├── components/
│   ├── notes/           # Notes UI (layout, sidebar, editor, markdown)
│   ├── tasks/           # Task tree, panels, note selector
│   ├── auth/            # Sign-in dialog and button
│   ├── sync/            # Sync provider and status
│   ├── pwa/             # Service worker registration
│   └── ui/              # shadcn/ui primitives (button, dialog, select…)
├── docs/                # Product docs (see RFC)
└── lib/
    ├── db.ts            # IndexedDB schema (Dexie)
    ├── notes.ts …       # Repository per entity (folders, tags, tasks)
    └── sync/            # Optional Supabase sync engine
```

## Documentation

The full v1 specification — context, technical design, data model, sync algorithm, and acceptance criteria — lives in [`src/docs/RFC.md`](src/docs/RFC.md).

## Status

Knit is a personal project and free to use. The v1 scope is complete: local notes, organization, tasks, offline PWA, and optional sync. See [`src/lib/changelog.ts`](src/lib/changelog.ts) for the running list of changes.
