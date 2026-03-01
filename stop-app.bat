@echo off
setlocal

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "LAUNCHER_DIR=%ROOT_DIR%\launcher\"
set "PS_CMD=$launcher = [IO.Path]::GetFullPath('%LAUNCHER_DIR%').ToLowerInvariant(); $killed = 0; Get-CimInstance Win32_Process | Where-Object { $_.Name -ieq 'node.exe' -and $_.CommandLine } | ForEach-Object { $cmd = $_.CommandLine.ToLowerInvariant(); if ($cmd.Contains($launcher) -and ($cmd.Contains('server-bootstrap.js') -or $cmd.Contains('server.js') -or $cmd.Contains('server.jsc'))) { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop; $killed++ } catch {} } }; Write-Output ('KILLED=' + $killed)"

for /f "usebackq tokens=1,2 delims==" %%A in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "%PS_CMD%"`) do (
  if /I "%%A"=="KILLED" set "KILLED_COUNT=%%B"
)

if not defined KILLED_COUNT set "KILLED_COUNT=0"

if "%KILLED_COUNT%"=="0" (
  echo CSR server is not running.
) else (
  echo Stopped %KILLED_COUNT% server process^(es^).
)

endlocal
