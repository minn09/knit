<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

- **Knit**: offline-first notes + tasks PWA. Next.js (App Router) + Tailwind, Dexie (IndexedDB) as the source of truth, optional Supabase sync.
- **Docs**: the v1 spec lives in `src/docs/RFC.md`. The `.atl/` folder is gitignored (skill tooling only).
- **UI primitives**: shadcn/ui on Base UI in `src/components/ui/`; toasts use `sonner` (the `<Toaster>` is mounted in `src/app/layout.tsx`).
- **Language**: docs and user-facing copy in Spanish; code identifiers in English.
- **Commands**: `pnpm dev`, `pnpm lint` (Biome), `pnpm build`.
