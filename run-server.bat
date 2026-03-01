@echo off
setlocal

set PORT=8080
set ROOT_DIR=%~dp0
set NODE_EXE=

if exist "%ROOT_DIR%runtime\node\node.exe" (
  set "NODE_EXE=%ROOT_DIR%runtime\node\node.exe"
) else if exist "%ROOT_DIR%node\node.exe" (
  set "NODE_EXE=%ROOT_DIR%node\node.exe"
)

if not defined NODE_EXE (
  where node >nul 2>nul
  if errorlevel 1 (
    echo Node.js runtime not found.
    echo For offline use, bundle node.exe in runtime\node\ or node\ folder.
    pause
    exit /b 1
  )
  set "NODE_EXE=node"
)

cd /d "%ROOT_DIR%"

set NEED_LAUNCHER_INSTALL=0
if not exist "%ROOT_DIR%launcher\node_modules\playwright-core" set NEED_LAUNCHER_INSTALL=1

if "%NEED_LAUNCHER_INSTALL%"=="1" (
  echo Required launcher dependencies are missing.
  echo Offline package is incomplete. Rebuild release with launcher\node_modules included.
  pause
  exit /b 1
)

echo Starting CSR local server on port %PORT%...
if exist "%ROOT_DIR%launcher\server.js" (
  "%NODE_EXE%" "%ROOT_DIR%launcher\server.js" %PORT%
) else (
  echo launcher\server.js is missing.
  pause
  exit /b 1
)

endlocal
