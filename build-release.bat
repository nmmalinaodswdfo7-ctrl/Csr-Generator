@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
set "TIMESTAMP=%DATE:~-4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "RELEASE_DIR=%ROOT_DIR%\release\CSR_GENERATOR_%TIMESTAMP%"
set "PORTABLE_NODE_EXE=%ROOT_DIR%\runtime\node\node.exe"
if not defined STRICT_PROTECT set "STRICT_PROTECT=1"
if not defined BUILD_EXE set "BUILD_EXE=1"
if not defined EXE_SMOKE_TEST set "EXE_SMOKE_TEST=1"
if not defined SAFE_BUILD set "SAFE_BUILD=1"
if not defined OBFUSCATE_JS set "OBFUSCATE_JS=0"
if not defined RUN_PREFLIGHT set "RUN_PREFLIGHT=1"
if not defined ENABLE_EXE_ICON set "ENABLE_EXE_ICON=1"
if not defined FORCE_UNSIGNED set "FORCE_UNSIGNED=0"

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

if "%RUN_PREFLIGHT%"=="1" (
  echo Running preflight validation...
  call :run_preflight "%RELEASE_DIR%"
  if errorlevel 1 (
    echo Preflight validation failed.
    pause
    exit /b 1
  )
  echo Preflight validation passed.
) else (
  echo Preflight validation skipped by RUN_PREFLIGHT=0.
)

echo Ensuring runtime data folders are preserved even when empty...
for %%D in ("downloads" "db") do (
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

if "%OBFUSCATE_JS%"=="1" (
  set "OBF_CONFIG=..\obfuscator.safe.json"
  set "OBF_SRC_SCRIPT=..\main\script.js"
  set "OBF_SRC_TEMPLATE=..\main\csr-template.js"
  set "OBF_SRC_SCSR_TEMPLATE=..\main\scsr-template.js"
  set "OBF_TMP_SCRIPT=..\main\script.obf.tmp.js"
  set "OBF_TMP_TEMPLATE=..\main\csr-template.obf.tmp.js"
  set "OBF_TMP_SCSR_TEMPLATE=..\main\scsr-template.obf.tmp.js"

  if not exist "!OBF_CONFIG!" (
    echo Missing obfuscation config: !OBF_CONFIG!
    popd
    pause
    exit /b 1
  )

  if exist "!OBF_TMP_SCRIPT!" del /f /q "!OBF_TMP_SCRIPT!" >nul 2>nul
  if exist "!OBF_TMP_TEMPLATE!" del /f /q "!OBF_TMP_TEMPLATE!" >nul 2>nul
  if exist "!OBF_TMP_SCSR_TEMPLATE!" del /f /q "!OBF_TMP_SCSR_TEMPLATE!" >nul 2>nul

  echo Obfuscating main\script.js ^(safe profile^)...
  call npx.cmd --no-install javascript-obfuscator "!OBF_SRC_SCRIPT!" --output "!OBF_TMP_SCRIPT!" --config "!OBF_CONFIG!"
  if errorlevel 1 goto :obfuscation_failed
  call node --check "!OBF_TMP_SCRIPT!"
  if errorlevel 1 goto :obfuscation_failed

  echo Obfuscating main\csr-template.js ^(safe profile^)...
  call npx.cmd --no-install javascript-obfuscator "!OBF_SRC_TEMPLATE!" --output "!OBF_TMP_TEMPLATE!" --config "!OBF_CONFIG!"
  if errorlevel 1 goto :obfuscation_failed
  call node --check "!OBF_TMP_TEMPLATE!"
  if errorlevel 1 goto :obfuscation_failed

  echo Obfuscating main\scsr-template.js ^(safe profile^)...
  call npx.cmd --no-install javascript-obfuscator "!OBF_SRC_SCSR_TEMPLATE!" --output "!OBF_TMP_SCSR_TEMPLATE!" --config "!OBF_CONFIG!"
  if errorlevel 1 goto :obfuscation_failed
  call node --check "!OBF_TMP_SCSR_TEMPLATE!"
  if errorlevel 1 goto :obfuscation_failed

  for %%T in ("__CSR_EXPORT_READY__" "csr_template_payload_v1" "basicInfo" "recommendation") do (
    findstr /C:"%%~T" "!OBF_TMP_SCRIPT!" >nul 2>nul
    if errorlevel 1 (
      echo Safe obfuscation guard failed for main\script.js: missing token %%~T
      goto :obfuscation_failed
    )
  )

  for %%T in ("__CSR_EXPORT_READY__" "__CSR_EXPORT_RENDER_SEQ__" "csr_template_payload_v1" "basicInfo" "recommendation") do (
    findstr /C:"%%~T" "!OBF_TMP_TEMPLATE!" >nul 2>nul
    if errorlevel 1 (
      echo Safe obfuscation guard failed for main\csr-template.js: missing token %%~T
      goto :obfuscation_failed
    )
  )

  for %%T in ("__CSR_EXPORT_READY__" "__CSR_EXPORT_RENDER_SEQ__" "scsr_template_payload_v1" "presentingProblem" "backgroundInformation" "caseAssessment" "interventionPlanImplementation" "caseManagementEvaluation" "recommendation") do (
    findstr /C:"%%~T" "!OBF_TMP_SCSR_TEMPLATE!" >nul 2>nul
    if errorlevel 1 (
      echo Safe obfuscation guard failed for main\scsr-template.js: missing token %%~T
      goto :obfuscation_failed
    )
  )

  move /y "!OBF_TMP_SCRIPT!" "!OBF_SRC_SCRIPT!" >nul
  if errorlevel 1 goto :obfuscation_failed
  move /y "!OBF_TMP_TEMPLATE!" "!OBF_SRC_TEMPLATE!" >nul
  if errorlevel 1 goto :obfuscation_failed
  move /y "!OBF_TMP_SCSR_TEMPLATE!" "!OBF_SRC_SCSR_TEMPLATE!" >nul
  if errorlevel 1 goto :obfuscation_failed

  echo Safe obfuscation complete.
  echo Skipping obfuscation for launcher\server.js to keep Playwright export stable.
) else (
  echo Obfuscation disabled by OBFUSCATE_JS=0.
)

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
  set "PACK_SCRIPT=pack:win"
  if "%SAFE_BUILD%"=="1" (
    if "%ENABLE_EXE_ICON%"=="1" (
      if exist "%RELEASE_DIR%\electron-builder.safe.icon.json" (
        set "PACK_SCRIPT=pack:win:safe:icon"
      ) else (
        echo ENABLE_EXE_ICON is on but electron-builder.safe.icon.json is missing. Falling back to icon-off safe config.
        if exist "%RELEASE_DIR%\electron-builder.safe.json" (
          set "PACK_SCRIPT=pack:win:safe"
        ) else (
          echo SAFE_BUILD enabled but electron-builder.safe.json is missing. Falling back to standard pack config.
        )
      )
    ) else (
      if exist "%RELEASE_DIR%\electron-builder.safe.json" (
        set "PACK_SCRIPT=pack:win:safe"
      ) else (
        echo SAFE_BUILD enabled but electron-builder.safe.json is missing. Falling back to standard pack config.
      )
    )
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

  echo Building Windows EXE installer using script: !PACK_SCRIPT!
  set "HAS_SIGNING_VARS=0"
  if defined CSC_LINK set "HAS_SIGNING_VARS=1"
  if defined WIN_CSC_LINK set "HAS_SIGNING_VARS=1"
  if defined CSC_NAME set "HAS_SIGNING_VARS=1"
  if defined CSC_KEY_PASSWORD set "HAS_SIGNING_VARS=1"
  if defined WIN_CSC_KEY_PASSWORD set "HAS_SIGNING_VARS=1"
  if "%FORCE_UNSIGNED%"=="1" (
    echo FORCE_UNSIGNED enabled. Packaging without code signing.
    set "CSC_IDENTITY_AUTO_DISCOVERY=false"
    set "CSC_LINK="
    set "CSC_NAME="
    set "WIN_CSC_LINK="
    set "CSC_KEY_PASSWORD="
    set "WIN_CSC_KEY_PASSWORD="
  ) else if "!HAS_SIGNING_VARS!"=="0" (
    echo No signing certificate variables detected. Packaging unsigned and disabling signer auto-discovery.
    set "CSC_IDENTITY_AUTO_DISCOVERY=false"
    set "CSC_LINK="
    set "CSC_NAME="
    set "WIN_CSC_LINK="
    set "CSC_KEY_PASSWORD="
    set "WIN_CSC_KEY_PASSWORD="
  ) else (
    echo Signing variables detected. Allowing electron-builder to sign this build.
    set "CSC_IDENTITY_AUTO_DISCOVERY=true"
  )
  set "PACK_LOG=%RELEASE_DIR%\pack-output.log"
  if exist "!PACK_LOG!" del /f /q "!PACK_LOG!" >nul 2>nul
  call npm.cmd run !PACK_SCRIPT! > "!PACK_LOG!" 2>&1
  set "PACK_EXIT=!ERRORLEVEL!"
  type "!PACK_LOG!"

  if not "!PACK_EXIT!"=="0" (
    set "CAN_RETRY_NO_ICON=0"
    if /I "!PACK_SCRIPT!"=="pack:win:safe:icon" set "CAN_RETRY_NO_ICON=1"
    if "!CAN_RETRY_NO_ICON!"=="1" (
      findstr /I /C:"Cannot create symbolic link" "!PACK_LOG!" >nul 2>nul
      if not errorlevel 1 (
        echo.
        echo Detected winCodeSign symlink privilege error while embedding EXE icon.
        echo Retrying with icon embedding disabled ^(pack:win:safe^).
        echo To keep EXE icon embedding, run build terminal as Administrator or enable Windows Developer Mode.
        set "PACK_SCRIPT=pack:win:safe"
        if exist "!PACK_LOG!" del /f /q "!PACK_LOG!" >nul 2>nul
        call npm.cmd run !PACK_SCRIPT! > "!PACK_LOG!" 2>&1
        set "PACK_EXIT=!ERRORLEVEL!"
        type "!PACK_LOG!"
      )
    )
  )
  if not "!PACK_EXIT!"=="0" (
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

  echo Preparing installer diagnostics launcher...
  if exist "%ROOT_DIR%\capture-install-diagnostics.ps1" (
    copy /y "%ROOT_DIR%\capture-install-diagnostics.ps1" "%RELEASE_DIR%\dist\capture-install-diagnostics.ps1" >nul
    (
      echo @echo off
      echo setlocal
      echo set "SCRIPT_DIR=%%~dp0"
      echo powershell -NoProfile -ExecutionPolicy Bypass -File "%%SCRIPT_DIR%%capture-install-diagnostics.ps1"
      echo endlocal
    ) > "%RELEASE_DIR%\dist\Install-CSR-With-Diagnostics.cmd"
    echo Created diagnostics installer launcher:
    echo   %RELEASE_DIR%\dist\Install-CSR-With-Diagnostics.cmd
  ) else (
    echo Skipped diagnostics launcher: capture-install-diagnostics.ps1 not found in project root.
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
  if exist "%RELEASE_DIR%\dist\Install-CSR-With-Diagnostics.cmd" (
    echo Installer launcher with diagnostics:
    echo %RELEASE_DIR%\dist\Install-CSR-With-Diagnostics.cmd
  )
)
echo.
echo To run release:
echo 1. cd /d "%RELEASE_DIR%"
echo 2. start-app.bat
echo.
pause
endlocal
goto :eof

:obfuscation_failed
echo Safe obfuscation failed. Release source files were not replaced.
if defined OBF_TMP_SCRIPT if exist "!OBF_TMP_SCRIPT!" del /f /q "!OBF_TMP_SCRIPT!" >nul 2>nul
if defined OBF_TMP_TEMPLATE if exist "!OBF_TMP_TEMPLATE!" del /f /q "!OBF_TMP_TEMPLATE!" >nul 2>nul
if defined OBF_TMP_SCSR_TEMPLATE if exist "!OBF_TMP_SCSR_TEMPLATE!" del /f /q "!OBF_TMP_SCSR_TEMPLATE!" >nul 2>nul
popd
pause
exit /b 1

:run_preflight
setlocal EnableExtensions
set "PF_RELEASE_DIR=%~1"
set "PF_SCRIPT=%PF_RELEASE_DIR%\main\script.js"
set "PF_TEMPLATE=%PF_RELEASE_DIR%\main\csr-template.js"
set "PF_SCSR_TEMPLATE=%PF_RELEASE_DIR%\main\scsr-template.js"

if not exist "%PF_SCRIPT%" (
  echo Preflight error: missing main\script.js
  endlocal & exit /b 1
)
if not exist "%PF_TEMPLATE%" (
  echo Preflight error: missing main\csr-template.js
  endlocal & exit /b 1
)
if not exist "%PF_SCSR_TEMPLATE%" (
  echo Preflight error: missing main\scsr-template.js
  endlocal & exit /b 1
)

node --check "%PF_SCRIPT%" >nul 2>nul
if errorlevel 1 (
  echo Preflight error: syntax check failed for main\script.js
  endlocal & exit /b 1
)
node --check "%PF_TEMPLATE%" >nul 2>nul
if errorlevel 1 (
  echo Preflight error: syntax check failed for main\csr-template.js
  endlocal & exit /b 1
)
node --check "%PF_SCSR_TEMPLATE%" >nul 2>nul
if errorlevel 1 (
  echo Preflight error: syntax check failed for main\scsr-template.js
  endlocal & exit /b 1
)

for %%T in ("__CSR_EXPORT_READY__" "csr_template_payload_v1" "basicInfo" "recommendation") do (
  findstr /C:"%%~T" "%PF_SCRIPT%" >nul 2>nul
  if errorlevel 1 (
    echo Preflight error: missing token in main\script.js: %%~T
    endlocal & exit /b 1
  )
)
for %%T in ("__CSR_EXPORT_READY__" "__CSR_EXPORT_RENDER_SEQ__" "csr_template_payload_v1" "basicInfo" "recommendation") do (
  findstr /C:"%%~T" "%PF_TEMPLATE%" >nul 2>nul
  if errorlevel 1 (
    echo Preflight error: missing token in main\csr-template.js: %%~T
    endlocal & exit /b 1
  )
)
for %%T in ("__CSR_EXPORT_READY__" "__CSR_EXPORT_RENDER_SEQ__" "scsr_template_payload_v1" "presentingProblem" "backgroundInformation" "caseAssessment" "interventionPlanImplementation" "caseManagementEvaluation" "recommendation") do (
  findstr /C:"%%~T" "%PF_SCSR_TEMPLATE%" >nul 2>nul
  if errorlevel 1 (
    echo Preflight error: missing token in main\scsr-template.js: %%~T
    endlocal & exit /b 1
  )
)

endlocal & exit /b 0
