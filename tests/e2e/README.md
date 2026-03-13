# Staging E2E Automation (Playwright + Python)

This suite automates frontend behavior in a real Chromium browser against a deployed staging URL.

Default operating mode is local-first and headed (visible browser).

## Scope (Phase 1)

- Roles: `superadmin`, `owner`
- Layer 1 (`journey`): login, leads, follow-ups, broadcasts, settings
- Layer 2 (`crawl`): safe broad UI interaction checks across allowlisted routes
- Artifacts: screenshot on failure, tracing zip, video, console/page/network diagnostics logs

## Install

Windows (PowerShell):

```powershell
& "C:\Users\adiba\AppData\Local\Python\pythoncore-3.14-64\python.exe" -m pip install --upgrade pip
& "C:\Users\adiba\AppData\Local\Python\pythoncore-3.14-64\python.exe" -m pip install -r tests\e2e\requirements.txt
& "C:\Users\adiba\AppData\Local\Python\pythoncore-3.14-64\python.exe" -m playwright install chromium
```

macOS/Linux:

```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r tests/e2e/requirements.txt
python3 -m playwright install chromium
```

Notes:
- If `pytest` is reported as 'not recognized', ensure the Python used above is on PATH or invoke it with the full path as shown.
- Use `E2E_HEADLESS=true` for headless CI runs; local debugging recommends `E2E_HEADLESS=false`.
- If Playwright browser download stalls, re-run the `playwright install chromium` command with an elevated shell.


## Required Environment Variables

- `E2E_BASE_URL` (example: `https://staging.example.com`)
- `E2E_SUPERADMIN_EMAIL`
- `E2E_SUPERADMIN_PASSWORD`
- `E2E_OWNER_EMAIL`
- `E2E_OWNER_PASSWORD`

Optional:

- `E2E_HEADLESS` (`false` by default, opens visible browser)
- `E2E_SLOW_MO_MS` (`0` by default)
- `E2E_ARTIFACT_DIR` (`tests/e2e/artifacts` by default)
- `E2E_ALLOW_PROD` (`false` by default; prevents production-like target URLs)
- `E2E_RUN_ID` (override run folder naming)

## Run

```bash
pnpm e2e:smoke
pnpm e2e:journey
pnpm e2e:crawl
pnpm e2e:full
```

Each run writes artifacts under `tests/e2e/artifacts/<run-id>/` with:
- `screenshots/`
- `videos/`
- `traces/`
- `logs/`
- `reports/summary.json` and `reports/summary.html`
