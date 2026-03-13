# Staging E2E Automation Strategy

## Objective

Provide deterministic browser-based validation on staging with a local-first operating model and optional manual CI execution.

## Enterprise Model

- Default: local headed browser (`E2E_HEADLESS=false`).
- CI: manual trigger only (`workflow_dispatch`), no recurring schedule.
- Two layers:
  - Journey suite (`smoke`, `journey`, `regression`) for business-critical determinism.
  - Crawl suite (`crawl`) for safe broad UI interaction checks.

## Current Coverage (Phase 1)

- Roles: Superadmin, Owner
- Journey routes: auth, leads, follow-ups, broadcasts, settings
- Crawl routes: leads, follow-ups, broadcasts, settings

## Staging Test Data Contract

- Maintain two dedicated automation users:
  - Superadmin automation account
  - Owner automation account
- Credentials are stored in CI secrets only.
- Ensure both accounts have access to all phase-1 routes/features.
- Ensure leads/follow-up datasets are non-empty where journey assertions depend on visible table states.
- Never use production user accounts or real customer identities.

## Failure Triage Checklist

- Download artifacts from failed run (`tests/e2e/artifacts/<run-id>` locally or CI artifact):
  - `*.png` screenshots (failure state)
  - `*.zip` Playwright traces
  - `*.webm` videos
  - `*.log` diagnostics
- Check diagnostics log sections in this order:
  - request failures
  - page errors
  - console errors
- Replay trace locally:
  - `python -m playwright show-trace <trace.zip>`
- If selector instability is root cause, add/adjust `data-testid` only on unstable controls.
- If environment data is root cause, refresh staging fixtures according to this contract.

## Phase 2 Expansion Matrix (Planned)

- Add dashboard/admin pages smoke coverage.
- Add settings deep interactions (knowledge base, commands, integrations).
- Add mobile route/component coverage.
- Add TMA (Telegram mini app) focused flows.
- Add role matrix completion (Staff and other role-based permutations).
