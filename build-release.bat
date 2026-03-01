@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "TIMESTAMP=%DATE:~-4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "RELEASE_DIR=%ROOT_DIR%\release\CSR_GENERATOR_%TIMESTAMP%"
set "PORTABLE_NODE_EXE=%ROOT_DIR%\runtime\node\node.exe"
set "STRICT_PROTECT=1"
set "BUILD_EXE=1"
set "EXE_SMOKE_TEST=1"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required but was not found.
  pause
  exit /b 1
)

if not exist "%PORTABLE_NODE_EXE%" (
  echo Portable Node runtime is required for offline users.
  echo Missing: %PORTABLE_NODE_EXE%
  echo.
  echo Add Node runtime files under:
  echo   runtime\node\
  echo Then run build-release.bat again.
  pause
  exit /b 1
)

echo Creating release folder:
echo %RELEASE_DIR%
mkdir "%RELEASE_DIR%" >nul 2>nul
if errorlevel 1 (
  echo Failed to create release directory.
  pause
  exit /b 1
)

echo Copying project files...
pushd "%ROOT_DIR%"
robocopy "." "%RELEASE_DIR%" /E /R:1 /W:1 ^
  /XD "release" ^
  /XF "*.log"
set "RC=%ERRORLEVEL%"
popd
if %RC% GEQ 8 (
  echo Failed while copying release files.
  pause
  exit /b 1
)

if not exist "%RELEASE_DIR%\runtime\node\node.exe" (
  echo Portable Node runtime was not copied to release.
  echo Expected: %RELEASE_DIR%\runtime\node\node.exe
  pause
  exit /b 1
)

echo Ensuring runtime data folders are preserved even when empty...
for %%D in ("downloads" "backup" "db") do (
  if not exist "%RELEASE_DIR%\%%~D" mkdir "%RELEASE_DIR%\%%~D" >nul 2>nul
  if not exist "%RELEASE_DIR%\%%~D\keep.txt" type nul > "%RELEASE_DIR%\%%~D\keep.txt"
)

if exist "%RELEASE_DIR%\build-release.bat" del /f /q "%RELEASE_DIR%\build-release.bat" >nul 2>nul

echo Installing launcher dependencies for release...
pushd "%RELEASE_DIR%\launcher"
call npm.cmd install
if errorlevel 1 (
  echo npm install failed in release launcher folder.
  popd
  pause
  exit /b 1
)

echo Obfuscating main\script.js in release copy...
call npx.cmd javascript-obfuscator "..\main\script.js" --output "..\main\script.js" --compact true --control-flow-flattening true --string-array true --rename-globals false --self-defending false
if errorlevel 1 (
  echo javascript-obfuscator failed.
  popd
  pause
  exit /b 1
)

echo Obfuscating main\csr-template.js in release copy...
call npx.cmd javascript-obfuscator "..\main\csr-template.js" --output "..\main\csr-template.js" --compact true --control-flow-flattening false --string-array true --rename-globals false --self-defending false
if errorlevel 1 (
  echo javascript-obfuscator failed for csr-template.js.
  popd
  pause
  exit /b 1
)

echo Skipping obfuscation for launcher\server.js to keep Playwright export stable.

if "%STRICT_PROTECT%"=="1" (
  echo Applying strict protection cleanup...
  if exist "build-bytecode.js" del /f /q "build-bytecode.js" >nul 2>nul
  if exist "server-bootstrap.js" del /f /q "server-bootstrap.js" >nul 2>nul
  if exist "server.jsc" del /f /q "server.jsc" >nul 2>nul
  if exist "package.json" del /f /q "package.json" >nul 2>nul
  if exist "package-lock.json" del /f /q "package-lock.json" >nul 2>nul
  if exist ".env.example" del /f /q ".env.example" >nul 2>nul
)

popd

if "%BUILD_EXE%"=="1" (
  if not exist "%RELEASE_DIR%\package.json" (
    echo EXE packaging skipped: package.json not found in release root.
    goto :after_exe_build
  )

  echo Installing desktop packager dependencies...
  pushd "%RELEASE_DIR%"
  call npm.cmd install --no-audit --no-fund
  if errorlevel 1 (
    echo npm install failed in release root.
    popd
    pause
    exit /b 1
  )

  echo Building Windows EXE installer...
  rem Safe unsigned build: prevent auto code-sign discovery/tools download.
  set "CSC_IDENTITY_AUTO_DISCOVERY=false"
  set "WIN_CSC_LINK="
  set "WIN_CSC_KEY_PASSWORD="
  call npm.cmd run pack:win
  if errorlevel 1 (
    echo EXE packaging failed.
    popd
    pause
    exit /b 1
  )
  popd

  if "%EXE_SMOKE_TEST%"=="1" (
    dir /b /a-d "%RELEASE_DIR%\dist\*.exe" >nul 2>nul
    if errorlevel 1 (
      echo Smoke test failed: no EXE output found in "%RELEASE_DIR%\dist".
      pause
      exit /b 1
    )
    echo Smoke test passed: EXE output detected.
  )
)

:after_exe_build

echo.
echo Release build complete.
echo Path: %RELEASE_DIR%
if "%BUILD_EXE%"=="1" (
  echo EXE output folder: %RELEASE_DIR%\dist
  if exist "%RELEASE_DIR%\dist\*.exe" (
    echo Generated installer^(s^):
    dir /b "%RELEASE_DIR%\dist\*.exe"
  )
  if exist "%RELEASE_DIR%\dist\win-unpacked\*.exe" (
    echo Generated portable app EXE:
    dir /b "%RELEASE_DIR%\dist\win-unpacked\*.exe"
  )
)
echo.
echo To run release:
echo 1. cd /d "%RELEASE_DIR%"
echo 2. start-app.bat
echo.
pause
endlocal
