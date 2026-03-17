from __future__ import annotations

import pytest
from playwright.sync_api import Page, expect

from tests.e2e.helpers.auth import login
from tests.e2e.helpers.navigation import open_page


@pytest.mark.parametrize("role", ["superadmin", "owner"])
@pytest.mark.smoke
@pytest.mark.journey
def test_broadcast_page_loads(page: Page, e2e_config, role: str) -> None:
    login(page, e2e_config, role)
    open_page(page, "/broadcasts", "broadcasts-page")
    message = page.get_by_test_id("broadcast-message-input")
    if message.count() > 0:
        expect(message.first).to_be_visible()
    else:
        expect(
            page.locator("textarea[placeholder*='broadcast']:visible, textarea:visible").first
        ).to_be_visible()

    send_button = page.get_by_test_id("broadcast-send-button")
    if send_button.count() > 0:
        expect(send_button.first).to_be_visible()
    else:
        expect(page.locator("button:visible:has-text('Send')").first).to_be_visible()


@pytest.mark.parametrize("role", ["superadmin", "owner"])
@pytest.mark.journey
@pytest.mark.regression
def test_broadcast_compose_and_confirm_cancel(page: Page, e2e_config, role: str) -> None:
    login(page, e2e_config, role)
    open_page(page, "/broadcasts", "broadcasts-page")

    message = page.get_by_test_id("broadcast-message-input")
    message.fill(f"E2E check for {role}")
    send_button = page.get_by_test_id("broadcast-send-button")
    expect(send_button).to_be_enabled()
    send_button.click()

    confirm_dialog = page.get_by_test_id("broadcast-confirm-dialog")
    expect(confirm_dialog).to_be_visible(timeout=20_000)
    page.get_by_test_id("broadcast-confirm-cancel").click()
    expect(confirm_dialog).not_to_be_visible(timeout=20_000)
