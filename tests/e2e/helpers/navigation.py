from __future__ import annotations

from playwright.sync_api import Page, expect


def open_page(page: Page, path: str, root_test_id: str) -> None:
    page.goto(path)
    page.wait_for_load_state("networkidle")
    root = page.get_by_test_id(root_test_id)
    if root.count() > 0:
        expect(root.first).to_be_visible(timeout=20_000)
        return
    expect(page.locator("body")).to_be_visible(timeout=20_000)
    assert path in page.url


def click_if_present(page: Page, test_id: str) -> bool:
    locator = page.get_by_test_id(test_id)
    if locator.count() == 0:
        return False
    locator.first.click()
    return True
