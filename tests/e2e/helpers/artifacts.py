from __future__ import annotations

from pathlib import Path

from playwright.sync_api import Page


def dump_dom_snapshot(page: Page, target_path: Path) -> None:
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_text(page.content(), encoding="utf-8")
