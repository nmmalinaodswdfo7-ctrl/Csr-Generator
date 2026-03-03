[CmdletBinding()]
param(
  [string]$InstallerPath = "",
  [string]$InstallerArgs = "",
  [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"

function Write-Info {
  param([string]$Message)
  Write-Host ("[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message)
}

function Safe-Json {
  param(
    [Parameter(Mandatory = $true)]$Value,
    [Parameter(Mandatory = $true)][string]$Path
  )
  $Value | ConvertTo-Json -Depth 8 | Set-Content -Path $Path -Encoding UTF8
}

function Export-EventSlice {
  param(
    [Parameter(Mandatory = $true)][string]$LogName,
    [Parameter(Mandatory = $true)][datetime]$StartTime,
    [Parameter(Mandatory = $true)][datetime]$EndTime,
    [Parameter(Mandatory = $true)][string]$OutPath
  )

  try {
    $events = Get-WinEvent -FilterHashtable @{
      LogName = $LogName
      StartTime = $StartTime
      EndTime = $EndTime
    } -ErrorAction Stop |
      Select-Object TimeCreated, Id, LevelDisplayName, ProviderName, Message

    if ($null -eq $events) {
      "[]" | Set-Content -Path $OutPath -Encoding UTF8
      return
    }

    Safe-Json -Value @($events) -Path $OutPath
  } catch {
    $payload = [ordered]@{
      logName = $LogName
      error = $_.Exception.Message
    }
    Safe-Json -Value $payload -Path $OutPath
  }
}

function Export-TextSummary {
  param(
    [Parameter(Mandatory = $true)][string]$RootDir,
    [Parameter(Mandatory = $true)][string]$InstallerFileName
  )

  $patterns = @(
    "ReadProcessMemory",
    "WriteProcessMemory",
    "code integrity",
    "blocked",
    "quarantine",
    "denied",
    "Palo Alto",
    "Cortex",
    "Traps",
    [Regex]::Escape($InstallerFileName)
  )

  $eventFiles = Get-ChildItem -Path $RootDir -Filter "events_*.json" -File -ErrorAction SilentlyContinue
  $matches = @()
  foreach ($file in $eventFiles) {
    try {
      $raw = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
      foreach ($pattern in $patterns) {
        if ($raw -match $pattern) {
          $matches += [ordered]@{
            file = $file.Name
            pattern = $pattern
          }
          break
        }
      }
    } catch {
      # Skip unreadable diagnostics files.
    }
  }

  $summaryPath = Join-Path $RootDir "quick-summary.txt"
  $lines = @()
  $lines += "Install Diagnostics Summary"
  $lines += ("Generated: {0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
  $lines += ""
  if ($matches.Count -eq 0) {
    $lines += "No obvious blocker keyword was found in collected event slices."
  } else {
    $lines += "Keyword hits found:"
    foreach ($hit in $matches) {
      $lines += ("- {0} : {1}" -f $hit.file, $hit.pattern)
    }
  }
  $lines -join [Environment]::NewLine | Set-Content -Path $summaryPath -Encoding UTF8
}

if ([string]::IsNullOrWhiteSpace($InstallerPath)) {
  $scriptDir = Split-Path -Parent $PSCommandPath
  $candidates = Get-ChildItem -Path $scriptDir -File -Filter "*Setup*.exe" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending
  if ($candidates -and $candidates.Count -gt 0) {
    $InstallerPath = $candidates[0].FullName
  } else {
    throw "InstallerPath was not provided and no '*Setup*.exe' was found beside the script."
  }
}

$resolvedInstaller = (Resolve-Path -Path $InstallerPath).Path
$installerFileName = [IO.Path]::GetFileName($resolvedInstaller)

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $OutputDir = Join-Path -Path (Split-Path -Parent $resolvedInstaller) -ChildPath ("install-diagnostics_{0}" -f $stamp)
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
$transcriptPath = Join-Path $OutputDir "session.log"

Start-Transcript -Path $transcriptPath -Force | Out-Null
try {
  Write-Info ("Installer: {0}" -f $resolvedInstaller)
  Write-Info ("OutputDir: {0}" -f $OutputDir)

  $hash = Get-FileHash -Path $resolvedInstaller -Algorithm SHA256
  $signature = Get-AuthenticodeSignature -FilePath $resolvedInstaller
  $envSnapshot = [ordered]@{
    computerName = $env:COMPUTERNAME
    userName = $env:USERNAME
    osVersion = [Environment]::OSVersion.VersionString
    powershell = $PSVersionTable.PSVersion.ToString()
    timestamp = (Get-Date).ToString("o")
    installer = $resolvedInstaller
    installerArgs = $InstallerArgs
    sha256 = $hash.Hash
    signerStatus = $signature.Status.ToString()
    signerStatusMessage = $signature.StatusMessage
    signerSubject = if ($signature.SignerCertificate) { $signature.SignerCertificate.Subject } else { "" }
  }
  Safe-Json -Value $envSnapshot -Path (Join-Path $OutputDir "environment.json")

  $start = Get-Date
  Write-Info ("Starting installer at {0}" -f $start.ToString("o"))
  if ([string]::IsNullOrWhiteSpace($InstallerArgs)) {
    $nsisLogPath = Join-Path $OutputDir "nsis-installer.log"
    $InstallerArgs = "/LOG=`"$nsisLogPath`""
    Write-Info ("Using default NSIS logging args: {0}" -f $InstallerArgs)
  }
  $proc = Start-Process -FilePath $resolvedInstaller -ArgumentList $InstallerArgs -PassThru
  $proc.WaitForExit()
  $end = Get-Date
  Write-Info ("Installer exit code: {0}" -f $proc.ExitCode)
  Write-Info ("Installer ended at {0}" -f $end.ToString("o"))

  $runMeta = [ordered]@{
    pid = $proc.Id
    exitCode = $proc.ExitCode
    start = $start.ToString("o")
    end = $end.ToString("o")
    durationSeconds = [Math]::Round(($end - $start).TotalSeconds, 2)
  }
  Safe-Json -Value $runMeta -Path (Join-Path $OutputDir "installer-run.json")

  $windowStart = $start.AddMinutes(-3)
  $windowEnd = $end.AddMinutes(3)

  $logsToCapture = @(
    "Application",
    "System",
    "Microsoft-Windows-CodeIntegrity/Operational",
    "Microsoft-Windows-Windows Defender/Operational",
    "Microsoft-Windows-AppLocker/EXE and DLL",
    "Microsoft-Windows-AppLocker/MSI and Script"
  )

  foreach ($logName in $logsToCapture) {
    $safeName = ($logName -replace "[^A-Za-z0-9]+", "_").Trim("_")
    $outPath = Join-Path $OutputDir ("events_{0}.json" -f $safeName)
    Write-Info ("Capturing {0}" -f $logName)
    Export-EventSlice -LogName $logName -StartTime $windowStart -EndTime $windowEnd -OutPath $outPath
  }

  $cortexPaths = @(
    "$env:ProgramData\Palo Alto Networks\Traps\logs",
    "$env:ProgramData\Palo Alto Networks\Traps\Logs",
    "$env:ProgramData\Cyvera\Logs"
  )
  $cortexSummary = @()
  foreach ($path in $cortexPaths) {
    if (Test-Path -Path $path) {
      try {
        $recent = Get-ChildItem -Path $path -File -ErrorAction Stop |
          Sort-Object LastWriteTime -Descending |
          Select-Object -First 25 Name, FullName, Length, LastWriteTime
        $cortexSummary += [ordered]@{
          path = $path
          files = @($recent)
        }
      } catch {
        $cortexSummary += [ordered]@{
          path = $path
          error = $_.Exception.Message
        }
      }
    }
  }
  Safe-Json -Value $cortexSummary -Path (Join-Path $OutputDir "cortex-log-index.json")

  Export-TextSummary -RootDir $OutputDir -InstallerFileName $installerFileName
  Write-Info "Diagnostics complete."
  Write-Info ("Collected files are in: {0}" -f $OutputDir)
} finally {
  Stop-Transcript | Out-Null
}
