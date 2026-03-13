from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator
from urllib.parse import urlparse

import pytest
from playwright.sync_api import Browser, BrowserContext, Page, Playwright, sync_playwright

from tests.e2e.helpers.reporting import write_html_summary, write_json_summary


def _env(name: str, default: str | None = None) -> str:
    value = os.getenv(name, default)
    if value is None or value == "":
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


@dataclass(frozen=True)
class E2EConfig:
    base_url: str
    artifact_root_dir: Path
    run_id: str
    artifact_run_dir: Path
    screenshot_dir: Path
    video_dir: Path
    trace_dir: Path
    log_dir: Path
    report_dir: Path
    headless: bool
    slow_mo_ms: int
    superadmin_email: str
    superadmin_password: str
    owner_email: str
    owner_password: str


@pytest.fixture(scope="session")
def e2e_config() -> E2EConfig:
    base_url = _env("E2E_BASE_URL")
    _guard_production_target(base_url)

    artifact_root_dir = Path(
        os.getenv("E2E_ARTIFACT_DIR", "tests/e2e/artifacts")
    ).resolve()
    run_id_raw = os.getenv("E2E_RUN_ID", datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S"))
    run_id = re.sub(r'[<>:"/\\|?*]', "-", run_id_raw).strip() or "local"
    artifact_run_dir = artifact_root_dir / run_id
    screenshot_dir = artifact_run_dir / "screenshots"
    video_dir = artifact_run_dir / "videos"
    trace_dir = artifact_run_dir / "traces"
    log_dir = artifact_run_dir / "logs"
    report_dir = artifact_run_dir / "reports"

    for folder in (
        artifact_root_dir,
        artifact_run_dir,
        screenshot_dir,
        video_dir,
        trace_dir,
        log_dir,
        report_dir,
    ):
        folder.mkdir(parents=True, exist_ok=True)

    return E2EConfig(
        base_url=base_url.rstrip("/"),
        artifact_root_dir=artifact_root_dir,
        run_id=run_id,
        artifact_run_dir=artifact_run_dir,
        screenshot_dir=screenshot_dir,
        video_dir=video_dir,
        trace_dir=trace_dir,
        log_dir=log_dir,
        report_dir=report_dir,
        headless=os.getenv("E2E_HEADLESS", "false").lower() != "false",
        slow_mo_ms=int(os.getenv("E2E_SLOW_MO_MS", "0")),
        superadmin_email=_env("E2E_SUPERADMIN_EMAIL"),
        superadmin_password=_env("E2E_SUPERADMIN_PASSWORD"),
        owner_email=_env("E2E_OWNER_EMAIL"),
        owner_password=_env("E2E_OWNER_PASSWORD"),
    )


@pytest.fixture(scope="session")
def playwright_instance() -> Iterator[Playwright]:
    with sync_playwright() as playwright:
        yield playwright


@pytest.fixture(scope="session")
def browser(playwright_instance: Playwright, e2e_config: E2EConfig) -> Iterator[Browser]:
    browser = playwright_instance.chromium.launch(
        headless=e2e_config.headless,
        slow_mo=e2e_config.slow_mo_ms,
    )
    yield browser
    browser.close()


@pytest.fixture()
def context(
    browser: Browser,
    request: pytest.FixtureRequest,
    e2e_config: E2EConfig,
) -> Iterator[BrowserContext]:
    test_name = request.node.nodeid.replace("::", "__").replace("/", "_").replace("\\", "_")
    context = browser.new_context(
        base_url=e2e_config.base_url,
        viewport={"width": 1440, "height": 900},
        record_video_dir=str(e2e_config.video_dir),
        ignore_https_errors=True,
    )
    context.tracing.start(screenshots=True, snapshots=True, sources=True)
    yield context
    context.tracing.stop(path=str(e2e_config.trace_dir / f"{test_name}.zip"))
    context.close()


@pytest.fixture()
def page(
    context: BrowserContext,
    request: pytest.FixtureRequest,
    e2e_config: E2EConfig,
) -> Iterator[Page]:
    test_name = request.node.nodeid.replace("::", "__").replace("/", "_").replace("\\", "_")
    page = context.new_page()
    console_logs: list[str] = []
    page_errors: list[str] = []
    request_failures: list[str] = []

    def _on_console(msg) -> None:
        console_logs.append(f"{msg.type}: {msg.text}")

    def _on_page_error(exc: Exception) -> None:
        page_errors.append(str(exc))

    def _on_request_failed(req) -> None:
        failure = req.failure
        if isinstance(failure, str):
            reason = failure
        elif failure is None:
            reason = "unknown error"
        else:
            reason = getattr(failure, "error_text", str(failure))
        request_failures.append(f"{req.method} {req.url} => {reason}")

    page.on("console", _on_console)
    page.on("pageerror", _on_page_error)
    page.on("requestfailed", _on_request_failed)
    yield page

    outcome = getattr(request.node, "rep_call", None)
    if outcome is not None and outcome.failed:
        screenshot_path = e2e_config.screenshot_dir / f"{test_name}.png"
        page.screenshot(path=str(screenshot_path), full_page=True)

    diagnostics_path = e2e_config.log_dir / f"{test_name}.log"
    diagnostics_path.write_text(
        "\n".join(
            [
                "=== Console ===",
                *console_logs,
                "",
                "=== Page Errors ===",
                *page_errors,
                "",
                "=== Request Failures ===",
                *request_failures,
            ]
        ),
        encoding="utf-8",
    )
    page.close()


@pytest.hookimpl(hookwrapper=True, tryfirst=True)
def pytest_runtest_makereport(item: pytest.Item, call: pytest.CallInfo):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)
    if rep.when != "call":
        return

    records = getattr(item.config, "_e2e_records", [])
    records.append(
        {
            "nodeid": item.nodeid,
            "outcome": rep.outcome,
            "duration": rep.duration,
            "markers": sorted(m.name for m in item.iter_markers()),
        }
    )
    setattr(item.config, "_e2e_records", records)


def pytest_sessionfinish(session: pytest.Session, exitstatus: int) -> None:
    config_obj = getattr(session.config, "_e2e_runtime_config", None)
    if config_obj is None:
        return
    e2e_config: E2EConfig = config_obj
    records: list[dict[str, Any]] = getattr(session.config, "_e2e_records", [])

    summary = {
        "runId": e2e_config.run_id,
        "baseUrl": e2e_config.base_url,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "exitStatus": exitstatus,
        "total": len(records),
        "passed": sum(1 for r in records if r["outcome"] == "passed"),
        "failed": sum(1 for r in records if r["outcome"] == "failed"),
        "skipped": sum(1 for r in records if r["outcome"] == "skipped"),
        "results": records,
    }
    write_json_summary(summary, e2e_config.report_dir / "summary.json")
    write_html_summary(summary, e2e_config.report_dir / "summary.html")
    (e2e_config.report_dir / "summary.txt").write_text(
        json.dumps(summary, indent=2),
        encoding="utf-8",
    )


@pytest.fixture(scope="session", autouse=True)
def register_runtime_config(request: pytest.FixtureRequest, e2e_config: E2EConfig) -> None:
    setattr(request.config, "_e2e_runtime_config", e2e_config)


def _guard_production_target(base_url: str) -> None:
    allow_prod = os.getenv("E2E_ALLOW_PROD", "false").lower() == "true"
    if allow_prod:
        return

    host = (urlparse(base_url).hostname or "").lower()
    blocked_hosts = {
        "titanjournal.com",
        "www.titanjournal.com",
    }
    blocked_fragments = {"production", ".prod.", "-prod.", "prod-"}
    if host in blocked_hosts or any(fragment in host for fragment in blocked_fragments):
        raise RuntimeError(
            "Refusing to run E2E against a production-like URL. "
            "Set E2E_ALLOW_PROD=true only if this is intentional."
        )
