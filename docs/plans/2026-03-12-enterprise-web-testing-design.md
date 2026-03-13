# Enterprise Web Testing Design (Local-First, Two-Layer)

## Problem

Current E2E coverage validates critical journeys, but enterprise-grade operation needs stronger governance for cost, safety, reliability, and broad UI coverage.

## Goals

- Local-first execution as primary workflow (visible browser by default).
- Keep GitHub Actions optional/manual to control cost.
- Expand from journey-only validation to two layers:
  - Layer A: deterministic journey tests.
  - Layer B: crawl-based UI interaction checks.
- Improve stability, diagnostics, and operational safety.

## Non-Goals

- Running full regression on every commit in hosted CI.
- Replacing existing Vitest unit/integration tests.
- Attempting destructive interaction with every control in crawl mode.

## Proposed Architecture

### Layer A: Journey Suite
- Keep business-critical role-based flows (`superadmin`, `owner`) as deterministic tests.
- Maintain explicit assertions and stable selectors (`data-testid` where needed).
- Tag tests by intent (`smoke`, `journey`, `regression`).

### Layer B: UI Crawl Suite
- Add a crawler test layer that discovers visible actionable controls and executes safe interaction probes.
- Use route allowlist and action safety rules (skip destructive actions by default).
- Emit per-page interaction inventory and failure records for triage.

## Operating Model

- Default execution: local workstation against staging URL with headed browser.
- Optional CI retained as manual workflow only (no schedule by default).
- Two profiles:
  - `smoke` for quick verification.
  - `regression` for broader coverage.

## Enterprise Controls

- Production URL guard to prevent accidental execution on prod.
- Retry policy for flaky transient failures (network/render timing).
- Standard run ID and artifact structure (`screenshots`, `trace`, `video`, `logs`, `reports`).
- Structured summary report (HTML + machine-readable JSON).

## Risk Handling

- **Data drift in staging**: seed contract and role-specific fixture assumptions.
- **Selector churn**: contract around test IDs for volatile controls.
- **Crawl instability**: strict safety classification and route scope controls.
- **Run-time cost**: local-first execution and optional/manual CI invocation.

## Success Criteria

- Local headed run is default and documented.
- Journey + crawl layers both runnable and separately selectable.
- Prod guard and artifact/report output working.
- CI workflow remains available but manual-only and minimal-cost.
