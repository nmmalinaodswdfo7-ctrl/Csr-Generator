# Migration TODO - CSR Generator (React + Tailwind + Node.js + Electron)

## Target Output

- Keep behavior identical to current app while migrating to React + Tailwind + Node.js + optional Electron wrapper.
- Migrate in phases with parity checks after each phase.
- Never rewrite everything in one pass.

## Do Not Migrate As Source

- `release/`
- `runtime/`
- `launcher/node_modules/`
- root `node_modules/` (if present)
- Keep only source from:
  - `main/index.html`
  - `main/script.js`
  - `main/csr-template.html`
  - `main/csr-template.js`
  - `launcher/server.js`
  - `launcher/electron-main.cjs`
  - `assets/`

## New Folder Structure

- `apps/web` (React + Tailwind UI)
- `apps/server` (Node API + file persistence + PDF export)
- `apps/desktop` (Electron wrapper)
- `packages/shared` (types, constants, validators)
- `data/` (runtime db, backup, downloads for dev)

## Core Packages To Install

### Web

- `react react-dom react-router-dom`
- `tailwindcss @tailwindcss/vite`
- `@tanstack/react-query`
- `react-hook-form zod @hookform/resolvers`
- `idb dayjs dompurify clsx`
- Rich text: `react-quill quill` (or TipTap stack)

### Server

- `express cors helmet dotenv zod fs-extra`
- `playwright-core`
- `uuid pino pino-http`

### Desktop

- `electron`
- `electron-builder`

### Dev

- `typescript tsx nodemon concurrently`
- `eslint prettier`

## Module Breakdown (split from current monolith)

- auth/session
- household cards list + filtering + pagination
- CSR workspace stepper (6 steps)
- basic info form + prefill
- family composition CRUD + restore/reset
- case development rich text editor
- interventions provided CRUD
- household intervention plan CRUD
- recommendation form + signature fields
- autosave + draft state
- local cache (localStorage + indexedDB)
- print preview modal
- PDF export flow
- municipality polling + update compare
- toast/alerts + error states
- deep-link CSR open flow
- server session SSE watcher

## Server API Parity Checklist (keep same routes first)

- `GET /api/session/stream`
- `POST /api/auth/login`
- `GET /api/session`
- `POST /api/session`
- `DELETE /api/session`
- `GET /api/runtime/diagnostics`
- `POST /api/downloads/verify`
- `POST /api/downloads/sheet`
- `GET /api/csr`
- `GET /api/csr/status`
- `GET /api/csr/by-id`
- `POST /api/csr`
- `POST /api/csr/cleanup`
- `POST /api/csr/ensure`
- `POST /api/export/csr-pdf`
- `GET /api/export/payload`
- `POST /api/export/payload`
- `GET /api/sheet`
- `GET /api/sheet/compare`

## React App Structure To Build

- `src/app` (router, providers)
- `src/pages/LoginPage`
- `src/pages/HouseholdSelectionPage`
- `src/pages/CsrWorkspacePage`
- `src/features/basic-info/*`
- `src/features/family-composition/*`
- `src/features/case-development/*`
- `src/features/interventions/*`
- `src/features/household-plan/*`
- `src/features/recommendation/*`
- `src/features/preview-export/*`
- `src/components/common/*`
- `src/services/api/*`
- `src/services/storage/*`
- `src/services/session/*`
- `src/templates/csr/*`

## Electron Migration Tasks

- Keep single-instance lock behavior.
- Keep dynamic free-port probing.
- Keep auto-start server child process.
- Keep `CSR_DATA_DIR` writable runtime data location.
- Keep external link handling via `shell.openExternal`.
- Keep shutdown cleanup (kill child server on quit).
- Update BrowserWindow URL to new web app server.
- Keep build configs and safe packaging options.
- Re-test installer + portable EXE behavior.

## Safe Migration Flow (anti-breakage)

- Phase 0: Freeze baseline behavior.
- Phase 1: Extract server into `apps/server` with identical routes/response shapes.
- Phase 2: Run old HTML UI against new server and verify parity.
- Phase 3: Build React shell and route-level skeletons.
- Phase 4: Migrate Login + Household list first.
- Phase 5: Migrate CSR Step 1-6 one module at a time.
- Phase 6: Migrate preview/export template and PDF render parity.
- Phase 7: Switch Electron to new app.
- Phase 8: Remove legacy frontend files only after parity signoff.

## Parity Test Matrix (must pass before cutover)

- Login success/fail and municipality lock.
- Session restore and logout.
- Household list search/filter/pagination.
- Create/open CSR record by household.
- All 6 steps autosave and reload persistence.
- Modal CRUD for interventions/household plan.
- Recommendation default names save/load.
- Print preview open/close/print/browser-open.
- PDF export success, filename sanitization, saved location.
- Municipality update compare and data refresh.
- Deep link CSR open by ID.
- Offline/local file fallback behavior.
- Electron app startup/shutdown and duplicate instance handling.

## Bug Prevention Rules During Migration

- Keep API contracts unchanged until final cleanup.
- Add schema validation (`zod`) at API boundaries.
- Add typed DTOs in `packages/shared`.
- Use feature flags to enable new modules gradually.
- Keep old and new UI runnable in parallel during migration.
- Add audit logs for export/session/csr writes.
- Add data backup on write operations (same as current backup flow).
- Add e2e smoke tests for login -> edit -> export.
- Block large refactors without passing parity checklist.

## Final Cutover Checklist

- All parity tests green on web mode.
- All parity tests green on Electron packaged mode.
- Old paths/scripts mapped to new scripts.
- Installer and portable build validated on clean machine.
- Rollback plan documented (previous release artifact ready).

## Immediate Next Step

- Generate a concrete execution board (`Phase -> Task -> Owner -> File -> Done criteria`) and starter monorepo scripts map.

## React.dev Installation Requirements (Official)

Last verified against React docs on March 5, 2026.

### Core requirements from React docs

- Install Node.js for local development (React docs explicitly require Node.js for real-world tooling).
- Do not use Create React App (deprecated by React docs).
- For new apps, React recommends starting with a framework.
- For existing projects, React docs recommend setting up a modular build tool (for example, Vite) first, then adding React.

### Official installation paths from React docs

- Recommended framework options:
  - `npx create-next-app@latest`
  - `npx create-react-router@latest`
  - `npx create-expo-app@latest`
- Build from scratch options:
  - `npm create vite@latest my-app -- --template react-ts`
  - `npm install --save-dev parcel`
  - `npx create-rsbuild --template react`
- Add React to an existing project:
  - `npm install react react-dom`
  - Use `createRoot` from `react-dom/client` and mount React into a DOM element with an `id`.

### Decision for this project (migration-safe)

- Use Vite + React (TypeScript template) for `apps/web` because this project is an existing custom stack and needs gradual migration.
- Keep current Node backend as separate app (`apps/server`) and keep API contract unchanged during migration.
- Keep Electron as wrapper app (`apps/desktop`) after web/server parity is complete.

### React installation TODOs for this repo

- [ ] Initialize workspace root package manager config (npm workspaces or pnpm workspaces).
- [ ] Create `apps/web` using Vite React TS template.
- [ ] Install `react` and `react-dom` in `apps/web`.
- [ ] Configure React entry mount (`createRoot`) and preserve existing HTML host behavior.
- [ ] Add React Router for page-level migration (`login`, `selection`, `workspace`).
- [ ] Add Tailwind setup (`tailwindcss`, `@tailwindcss/vite`) and remove CDN Tailwind usage.
- [ ] Keep old UI reachable while migrating module-by-module to React.
- [ ] Add parity smoke test: React app boot + API reachability + one CSR save/load flow.

### References (official docs)

- https://react.dev/learn/installation
- https://react.dev/learn/creating-a-react-app
- https://react.dev/learn/build-a-react-app-from-scratch
- https://react.dev/learn/add-react-to-an-existing-project

## React Installation - Exact Steps (Do This In Order)

### 0) Prerequisites (Windows PowerShell)

1. Install Node.js LTS.
2. Verify tools:
   - `node -v`
   - `npm -v`
3. From project root (`CSR GENERATOR`), create a safety branch:
   - `git checkout -b chore/react-migration-setup`

### 1) Create React app inside this repo

1. From project root:
   - `npm create vite@latest apps/web -- --template react-ts`
2. Install dependencies:
   - `cd apps/web`
   - `npm install`

### 2) Install React app runtime libraries

1. Router + data layer + forms + validation + utilities:
   - `npm install react-router-dom @tanstack/react-query react-hook-form zod @hookform/resolvers idb dayjs clsx dompurify react-hot-toast`
2. Rich text editor replacement for Summernote:
   - `npm install react-quill quill`

### 3) Install Tailwind CSS (Vite setup)

- Reference: https://tailwindcss.com/docs/installation/using-vite

1. Install Tailwind and the official Vite plugin:
   - `npm install tailwindcss @tailwindcss/vite`
2. Update `vite.config.ts` to register the Tailwind plugin:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

3. Replace `src/index.css` content with:

```css
@import "tailwindcss";
```

4. Start dev server and verify Tailwind classes apply:
   - `npm run dev`

### 4) Wire React root correctly

1. Ensure `src/main.tsx` uses `createRoot` from `react-dom/client`.
2. Wrap app with `BrowserRouter`.
3. Add `QueryClientProvider` for React Query.
4. Keep initial routes simple:
   - `/` -> Login page placeholder
   - `/households` -> Selection page placeholder
   - `/csr/:csrId` -> Workspace page placeholder

### 5) Add migration-safe starter folders

Inside `apps/web/src`, create:

- `app/`
- `pages/`
- `features/`
- `components/common/`
- `services/api/`
- `services/storage/`
- `services/session/`
- `templates/csr/`

### 6) Add environment config for API base URL

1. Create `apps/web/.env`:
   - `VITE_API_BASE_URL=http://127.0.0.1:8080`
2. In API client, read from `import.meta.env.VITE_API_BASE_URL`.

### 7) Run and verify React app

1. From `apps/web`:
   - `npm run dev`
2. Confirm app opens and routes render.
3. Confirm Tailwind classes apply.

### 8) First parity checkpoint (before module migration)

- React app boots with no console errors.
- Router works for 3 starter routes.
- API client can hit `GET /api/session`.
- No old `main/index.html` flow changed yet.

### 9) Only after setup is stable, start module migration

Order:

1. Login + session
2. Household list/filter/pagination
3. CSR Step 1 to Step 6
4. Print preview + export
5. Final Electron wiring

### 10) Optional root scripts for convenience

At repo root, add scripts to run web + server together:

- `dev:web` -> run Vite in `apps/web`
- `dev:server` -> run Node server in `apps/server` (after extraction)
- `dev` -> run both via `concurrently`
