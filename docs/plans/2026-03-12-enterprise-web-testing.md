# Enterprise Web Testing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade frontend web testing to a local-first, enterprise-grade two-layer E2E system (journey + crawl) against staging.

**Architecture:** Keep deterministic journey tests for critical role-based flows and add a safe UI crawl layer for broad interaction coverage. Add operational controls: production guard, profile-based runs, retries, structured artifacts, and reporting. Keep CI as manual-only for cost control.

**Tech Stack:** Python, pytest, Playwright Chromium, GitHub Actions (manual optional), Next.js frontend selectors.

---

### Task 1: Local-first runtime and safety controls

**Files:**
- Modify: `tests/e2e/conftest.py`
- Modify: `tests/e2e/README.md`
- Test: `tests/e2e/specs/test_auth_flows.py`

**Step 1: Write the failing test**

Add/adjust tests that assume:
- default headed local run
- production URL guard rejects prod domains

**Step 2: Run test to verify it fails**

Run: `pytest tests/e2e/specs/test_auth_flows.py -q`  
Expected: FAIL until conftest safety/default behavior is implemented.

**Step 3: Write minimal implementation**

Implement:
- `E2E_HEADLESS` default `false`
- prod URL denylist guard
- deterministic run ID artifact folders

**Step 4: Run test to verify it passes**

Run: `pytest tests/e2e/specs/test_auth_flows.py -q`  
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/e2e/conftest.py tests/e2e/README.md tests/e2e/specs/test_auth_flows.py
git commit -m "test(e2e): add local-first defaults and prod guard"
```

### Task 2: Test taxonomy and run profiles

**Files:**
- Modify: `tests/e2e/specs/test_*.py`
- Create: `tests/e2e/pytest.ini`
- Modify: `package.json`

**Step 1: Write the failing test**

Use markers in tests (`smoke`, `journey`, `crawl`) and commands that select subsets.

**Step 2: Run test to verify it fails**

Run: `pytest tests/e2e/specs -m smoke -q`  
Expected: marker warnings/failure until markers are registered.

**Step 3: Write minimal implementation**

Register markers in pytest config and add package scripts:
- `e2e:smoke`
- `e2e:journey`
- `e2e:crawl`
- `e2e:full`

**Step 4: Run test to verify it passes**

Run:
- `pytest tests/e2e/specs -m smoke -q`
- `pytest tests/e2e/specs -m journey -q`

Expected: PASS and marker filtering works.

**Step 5: Commit**

```bash
git add tests/e2e/specs tests/e2e/pytest.ini package.json
git commit -m "test(e2e): add marker taxonomy and run profiles"
```

### Task 3: Add crawl layer (safe interaction probes)

**Files:**
- Create: `tests/e2e/helpers/crawl.py`
- Create: `tests/e2e/specs/test_ui_crawl.py`
- Modify: `tests/e2e/helpers/navigation.py`

**Step 1: Write the failing test**

Create crawl tests for allowlisted routes; verify non-destructive controls can be interacted with and failures are reported.

**Step 2: Run test to verify it fails**

Run: `pytest tests/e2e/specs/test_ui_crawl.py -q`  
Expected: FAIL before crawler implementation.

**Step 3: Write minimal implementation**

Implement:
- control discovery heuristics
- safe action whitelist (click/text entry only)
- destructive guard (skip controls matching delete/remove/logout etc.)
- per-page crawl report JSON

**Step 4: Run test to verify it passes**

Run: `pytest tests/e2e/specs/test_ui_crawl.py -q`  
Expected: PASS with crawl report output.

**Step 5: Commit**

```bash
git add tests/e2e/helpers/crawl.py tests/e2e/specs/test_ui_crawl.py tests/e2e/helpers/navigation.py
git commit -m "test(e2e): add safe UI crawl coverage layer"
```

### Task 4: Reporting and diagnostics hardening

**Files:**
- Modify: `tests/e2e/conftest.py`
- Create: `tests/e2e/helpers/reporting.py`
- Modify: `docs/testing/staging-e2e.md`

**Step 1: Write the failing test**

Expect run summary artifacts:
- JSON summary
- HTML summary
- standardized folder structure

**Step 2: Run test to verify it fails**

Run: `pytest tests/e2e/specs -q`  
Expected: missing report artifacts.

**Step 3: Write minimal implementation**

Aggregate test outcomes and emit structured summaries at session end.

**Step 4: Run test to verify it passes**

Run: `pytest tests/e2e/specs -q`  
Expected: summary files generated.

**Step 5: Commit**

```bash
git add tests/e2e/conftest.py tests/e2e/helpers/reporting.py docs/testing/staging-e2e.md
git commit -m "test(e2e): add enterprise run reporting"
```

### Task 5: Local-first + optional CI workflow tuning

**Files:**
- Modify: `.github/workflows/e2e-staging.yml`
- Modify: `tests/e2e/README.md`

**Step 1: Write the failing test**

N/A config change; validate workflow is manual-only and docs match local-first policy.

**Step 2: Run validation to verify current behavior differs**

Inspect workflow and docs.

**Step 3: Write minimal implementation**

Remove schedule trigger, keep `workflow_dispatch` only, and document policy.

**Step 4: Run validation to verify expected behavior**

Confirm workflow has no schedule and docs include local-first guidance.

**Step 5: Commit**

```bash
git add .github/workflows/e2e-staging.yml tests/e2e/README.md
git commit -m "ci(e2e): switch to manual-only workflow and local-first policy"
```
