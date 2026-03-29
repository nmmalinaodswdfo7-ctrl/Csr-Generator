# Tauri Migration Recommendation

## Recommendation

Do not do a full Electron-to-Tauri migration immediately.

The current app is not just a desktop shell around static HTML. It depends on a local Node server, filesystem-backed runtime data, Playwright-based export/print flows, and child-process startup from Electron. That means a Tauri migration is possible, but it is not a simple wrapper swap. It is a platform rewrite of the desktop runtime layer.

If you want to migrate, the safer recommendation is:

1. Do a phased migration, not a big-bang rewrite.
2. Prefer Tauri v2 for a new migration started in 2026.
3. Only proceed now if the goal is smaller installer size, tighter OS integration, or long-term Electron replacement and you accept medium-to-high migration risk.

## Why I am not recommending an immediate full migration

### Current app architecture is Node-heavy

Your desktop app currently relies on:

- `launcher/electron-main.cjs` creating the desktop window
- a forked local Node server via `launcher/server.js`
- runtime writable directories for `downloads` and `db`
- HTTP serving of `main/index.html`
- Playwright for export/PDF flows
- Electron window behavior and packaging

This means the desktop logic is not trivial to port.

### Tauri can support this, but not as a drop-in replacement

From the official Tauri v1 docs:

- Tauri configuration supports `beforeDevCommand`, `beforeBuildCommand`, `devPath`, and `distDir`, which is good for frontend build orchestration.
- Tauri config also supports `resources` and `externalBin`, which can help bundle extra files/binaries.
- Windows bundling supports WebView2 installer modes such as bootstrapper or skip.

Those are useful, but they do not automatically replace:

- your current Node HTTP server
- child process orchestration
- Playwright export runtime
- Electron-specific window/runtime assumptions

## What maps well to Tauri

These parts are good candidates:

- The frontend itself in `main/`
- Static assets
- Window title/icon/basic packaging
- Native filesystem access through Tauri APIs or commands
- Local database file storage if you move the logic behind Tauri commands

## What does not map cleanly

These are the main migration risks:

### 1. Local Node server model

Right now the app starts a localhost server and serves the app through HTTP.

In Tauri, the usual model is:

- load frontend assets directly from the app bundle in production
- call Rust commands for native work

So your current server-centered runtime would need one of these:

- a real rewrite into Tauri commands/plugins
- or a sidecar process approach

### 2. Playwright export/print flow

If export/PDF currently depends on Playwright/Chromium behavior, that is a major migration concern.

In Tauri you would likely need one of:

- keep a sidecar binary/runtime for export
- replace the export strategy
- move print/export logic to another service layer

This is one of the biggest reasons I would not call the app “ready to migrate quickly”.

### 3. Session and runtime file behavior

Your Electron app already has a writable runtime-data strategy.

Tauri can absolutely support writable app data directories, but the code that currently assumes:

- Node `fs`
- child processes
- HTTP endpoints

would need to move behind Tauri APIs/commands.

### 4. Release behavior differences

You already have desktop/runtime-specific behavior differences in Electron release.

A Tauri migration would reduce some Electron-specific issues, but it would also introduce a new runtime model:

- WebView2 on Windows
- Rust command layer
- allowlist/security configuration

So migration itself is not the safest way to solve short-term UI bugs.

## Are we good to go?

### Short answer

Not for a direct immediate migration.

### Better answer

You are good to go only for a phased migration plan, not a quick replacement.

If the question is:

"Can we replace Electron with Tauri now without major rewrite risk?"

My recommendation is:

No.

If the question is:

"Can we start preparing a safe migration path to Tauri?"

My recommendation is:

Yes.

## Best migration strategy

### Option A: Stay on Electron for now, prepare the codebase

This is the safest path.

Do these first:

1. Separate frontend UI code from server/runtime code more cleanly.
2. Inventory all places that rely on:
   - Node `fs`
   - HTTP server endpoints
   - child processes
   - Playwright export
3. Move business logic away from Electron assumptions.
4. Define a small native boundary layer so the frontend does not care whether the backend is Electron or Tauri.

After that, Tauri becomes much safer.

### Option B: Pilot Tauri in parallel

Create a small parallel Tauri shell that proves only these first:

1. Load the existing frontend
2. Open/save local files
3. Read/write the database/runtime directories
4. Handle one export scenario
5. Build a Windows installer successfully

If that prototype succeeds, continue migration.
If not, stay on Electron.

This is the best practical validation path.

## If you migrate, prefer Tauri v2

You gave Tauri v1 docs, and they are useful for understanding the model.

But for a new migration started now, I recommend evaluating Tauri v2 instead of committing to v1 first.

Reason:

- v1 docs are still helpful for concepts
- but a fresh migration should target the newer supported path unless you have a hard dependency on v1

## Minimum safe checklist before migration

- Confirm whether Playwright export can be kept or replaced
- Decide whether to remove the local Node server or keep it as a sidecar
- Confirm local DB/runtime file access strategy in Tauri
- Confirm Windows bundling and WebView2 behavior
- Confirm print/export parity with current Electron release
- Build one working proof-of-concept before committing

## Final recommendation

Recommendation:

- Keep Electron as the production desktop runtime for now
- Do not start a full migration yet
- If you want Tauri, start with a proof-of-concept and a phased migration plan
- If migration proceeds, target Tauri v2, not a fresh long-term v1 adoption

This is the safest decision based on the current codebase.

## Official references reviewed

- Tauri v1 Guides: https://v1.tauri.app/v1/guides/
- Tauri v1 Windows build guide: https://v1.tauri.app/v1/guides/building/windows
- Tauri v1 Config API: https://v1.tauri.app/v1/api/config/
- Tauri v1 WebView versions reference: https://v1.tauri.app/v1/references/webview-versions/
