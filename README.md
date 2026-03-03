# CSR Generator

CSR Generator is a desktop app that helps social workers create and manage Case Study Reports (CSR) faster and more consistently.

## What This App Is For

Use this app to:

- Log in with your ID and municipality
- View household records
- Search and filter households
- Fill out CSR details step by step
- Save your work while you are editing
- Preview the final report
- Export a clean PDF copy for printing or submission

## Main Features

- Easy login using ID and municipality
- Household list with search, filters, and paging
- Guided CSR workflow with 6 sections:
  - Basic Information
  - Family Composition
  - Case Development
  - Interventions Provided
  - Household Intervention Plan
  - Recommendation
- Auto-save while typing in forms
- PDF export of the final CSR

## Who Should Use It

- Social workers
- Municipal social welfare staff

## Simple Workflow

1. Open the app.
2. Log in with your ID and municipality.
3. Select a household.
4. Complete all CSR sections.
5. Review in print preview.
6. Export to PDF.

## Important Notes

- Your work is saved locally in this project folder.
- Use the same municipality assigned to your ID.
- Make sure Microsoft Edge or Google Chrome is installed for PDF export.

## Safer Windows Build (AV/EDR Friendly)

- Run `build-release.bat` to use the safer build profile by default.
- Safe defaults in `build-release.bat`:
  - `SAFE_BUILD=1` (uses `electron-builder.safe.json`)
  - `OBFUSCATE_JS=1` (safe JS obfuscation enabled)
  - `FORCE_UNSIGNED=0` (allows signing if cert env vars are set)
- Outputs include:
  - NSIS installer
  - Portable `.exe`

### Optional Overrides

- Force unsigned build:
  - `set FORCE_UNSIGNED=1 && build-release.bat`
- Disable obfuscation:
  - `set OBFUSCATE_JS=0 && build-release.bat`
- Enable EXE icon embedding:
  - `set ENABLE_EXE_ICON=1 && build-release.bat`
- Use old packaging config:
  - `set SAFE_BUILD=0 && build-release.bat`

### Obfuscation Safety

- Obfuscation uses a conservative profile (no control-flow flattening, no global renaming).
- Build writes obfuscated output to temporary files first.
- Each obfuscated file is syntax-checked with `node --check`.
- Originals are replaced only after all checks pass.

### Desktop Icon Note

- Default safe build keeps `signAndEditExecutable` off for maximum packaging stability.
- To embed `assets/logo.ico` into the app `.exe`, run with `ENABLE_EXE_ICON=1`.
- If icon looks unchanged after install, refresh Windows icon cache or recreate the desktop shortcut.

### Municipality Update Polling

- Municipality change checks run every 5 minutes.
- Checks only run while the app window is visible.
- When the window/tab is hidden, background polling is paused.

### If You Hit winCodeSign Symlink Errors

- Error example:
  - `Cannot create symbolic link ... winCodeSign ... A required privilege is not held by the client`
- Fix:
  - Close running build terminals.
  - Delete `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign`
  - Run `build-release.bat` again.
- The safe build now disables signer auto-discovery unless signing cert variables are explicitly set.

## Capture Install Culprit Logs

If install fails with:

- `Only part of a ReadProcessMemory or WriteProcessMemory request was completed`

After `build-release.bat`, the build now auto-generates:

- `dist\capture-install-diagnostics.ps1`
- `dist\Install-CSR-With-Diagnostics.cmd`

On target PCs, use `Install-CSR-With-Diagnostics.cmd` instead of launching setup `.exe` directly.
It will automatically run the installer with diagnostics and collect logs.

Manual alternative:

```powershell
powershell -ExecutionPolicy Bypass -File .\capture-install-diagnostics.ps1
```

Optional with installer arguments:

```powershell
powershell -ExecutionPolicy Bypass -File .\capture-install-diagnostics.ps1 -InstallerPath ".\dist\CSR Generator Setup 1.0.0.exe" -InstallerArgs "/S"
```

This creates `install-diagnostics_YYYYMMDD_HHMMSS` with:

- `environment.json` (hash/signature/system info)
- `installer-run.json` (exit code + timing)
- `events_*.json` (Application/System/CodeIntegrity/Defender/AppLocker slices)
- `cortex-log-index.json` (detected Cortex/Traps log files)
- `quick-summary.txt` (keyword hits)
