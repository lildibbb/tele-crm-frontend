from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import Page


DESTRUCTIVE_KEYWORDS = {
    "delete",
    "remove",
    "destroy",
    "logout",
    "sign out",
    "revoke",
    "deactivate",
    "cancel",
}


@dataclass(frozen=True)
class CrawlTarget:
    path: str
    root_test_id: str


def discover_safe_controls(page: Page) -> list[tuple[str, str]]:
    controls: list[tuple[str, str]] = []
    locators = page.locator("button, a, [role='button']")
    count = min(locators.count(), 200)
    for i in range(count):
        node = locators.nth(i)
        text = (node.inner_text(timeout=500) or "").strip().lower()
        testid = node.get_attribute("data-testid") or ""
        descriptor = testid or text or f"control-{i}"
        if _looks_destructive(descriptor):
            continue
        controls.append((descriptor[:120], f"(button-like)[{i}]"))
    return controls


def probe_safe_interactions(page: Page, max_clicks: int = 20) -> list[dict[str, str]]:
    interactions: list[dict[str, str]] = []
    locators = page.locator("button, [role='button'], a")
    max_items = min(locators.count(), max_clicks)
    for i in range(max_items):
        node = locators.nth(i)
        label = (node.get_attribute("data-testid") or node.inner_text(timeout=500) or "").strip()
        label = label[:120] if label else f"control-{i}"
        if _looks_destructive(label):
            interactions.append({"control": label, "result": "skipped-destructive"})
            continue
        try:
            node.click(timeout=1500)
            page.wait_for_timeout(120)
            interactions.append({"control": label, "result": "clicked"})
        except PlaywrightError as err:
            interactions.append({"control": label, "result": f"error:{str(err)[:140]}"})
    return interactions


def write_crawl_report(
    report_path: Path,
    target_path: str,
    controls: Iterable[tuple[str, str]],
    interactions: list[dict[str, str]],
) -> None:
    data = {
        "path": target_path,
        "discoveredControls": [{"label": c[0], "selectorRef": c[1]} for c in controls],
        "interactions": interactions,
    }
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def _looks_destructive(value: str) -> bool:
    lowered = value.lower()
    return any(keyword in lowered for keyword in DESTRUCTIVE_KEYWORDS)
