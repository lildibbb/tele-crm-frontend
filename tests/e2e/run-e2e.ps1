param(
    [Parameter(Mandatory = $false)]
    [string]$Profile = "smoke"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$EnvFile = Join-Path $ScriptDir ".env"

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if (-not $line) { return }
        if ($line.StartsWith("#")) { return }

        $parts = $line -split "=", 2
        if ($parts.Length -ne 2) { return }

        $name = $parts[0].Trim()
        $value = $parts[1].Trim()

        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Process)
    }
}
else {
    Write-Host "No tests/e2e/.env file found - using current environment variables."
}

# Sanitize run id for Windows path safety.
$runId = [System.Environment]::GetEnvironmentVariable("E2E_RUN_ID", [System.EnvironmentVariableTarget]::Process)
if (-not [string]::IsNullOrWhiteSpace($runId)) {
    $safeRunId = [regex]::Replace($runId, '[<>:"/\\|?*]', '-')
    if ($safeRunId -ne $runId) {
        [System.Environment]::SetEnvironmentVariable("E2E_RUN_ID", $safeRunId, [System.EnvironmentVariableTarget]::Process)
        Write-Host ("Adjusted E2E_RUN_ID to path-safe value: " + $safeRunId)
    }
}

$python = $env:E2E_PYTHON
$defaultPython = "C:\Users\adiba\AppData\Local\Python\pythoncore-3.14-64\python.exe"
if ([string]::IsNullOrWhiteSpace($python) -or -not (Test-Path $python)) {
    if (Test-Path $defaultPython) {
        $python = $defaultPython
    }
    else {
        $python = "python"
    }
}

$profileLower = $Profile.ToLowerInvariant()
switch ($profileLower) {
    "install" {
        & $python -m pip install -r (Join-Path $ScriptDir "requirements.txt")
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

        & $python -m playwright install chromium
        exit $LASTEXITCODE
    }
    "smoke" {
        $pytestArgs = @("-c", "tests/e2e/pytest.ini", "tests/e2e/specs", "-m", "smoke", "-q")
    }
    "journey" {
        $pytestArgs = @("-c", "tests/e2e/pytest.ini", "tests/e2e/specs", "-m", "journey", "-q")
    }
    "crawl" {
        $pytestArgs = @("-c", "tests/e2e/pytest.ini", "tests/e2e/specs/test_ui_crawl.py", "-q")
    }
    "full" {
        $pytestArgs = @("-c", "tests/e2e/pytest.ini", "tests/e2e/specs", "-q")
    }
    default {
        Write-Host "Unknown profile: $Profile. Use install|smoke|journey|crawl|full"
        exit 2
    }
}

Write-Host ("Using python: " + $python)
Write-Host ("Running pytest with args: " + ($pytestArgs -join " "))
& $python -m pytest @pytestArgs
exit $LASTEXITCODE
