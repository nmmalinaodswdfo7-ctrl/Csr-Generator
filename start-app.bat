@echo off
setlocal

set PORT=8080
set APP_URL=http://127.0.0.1:%PORT%/main/index.html
set ROOT_DIR=%~dp0

if not exist "%ROOT_DIR%run-server.bat" (
  echo run-server.bat not found.
  pause
  exit /b 1
)

echo Launching CSR local server...
start "CSR Local Server" /b cmd /c ""%ROOT_DIR%run-server.bat""

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
  start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "%APP_URL%"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
  start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "%APP_URL%"
) else (
  start "" "%APP_URL%"
)

echo App started: %APP_URL%
echo Finalizing startup in background...
set READY=0
for /L %%I in (1,1,20) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "try { $r = Invoke-WebRequest -Uri '%APP_URL%' -UseBasicParsing -TimeoutSec 1; if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { exit 0 } else { exit 1 } } catch { exit 1 }"
  if not errorlevel 1 (
    set READY=1
    goto :ready
  )
  timeout /t 1 /nobreak >nul
)

:ready
if "%READY%"=="1" (
  echo Server is ready.
) else (
  echo Server is still starting. If the page does not load yet, wait a few seconds and refresh.
)
echo Closing this terminal will stop the local server.
endlocal
