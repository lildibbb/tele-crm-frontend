from __future__ import annotations

import pytest
from playwright.sync_api import Page, expect

from tests.e2e.helpers.auth import login
from tests.e2e.helpers.navigation import open_page


@pytest.mark.parametrize("role", ["superadmin", "owner"])
@pytest.mark.smoke
@pytest.mark.journey
def test_settings_page_loads(page: Page, e2e_config, role: str) -> None:
    login(page, e2e_config, role)
    open_page(page, "/settings", "settings-page")
    bot_config = page.get_by_test_id("settings-tab-bot-config")
    if bot_config.count() > 0:
        expect(bot_config.first).to_be_visible()
    else:
        expect(page.get_by_role("heading", name="Settings").first).to_be_visible()


@pytest.mark.parametrize(
    "tab_test_id",
    [
        "settings-tab-bot-config",
        "settings-tab-knowledge-base",
        "settings-tab-commands",
        "settings-tab-team",
    ],
)
@pytest.mark.journey
@pytest.mark.regression
def test_settings_tab_navigation(page: Page, e2e_config, tab_test_id: str) -> None:
    login(page, e2e_config, "superadmin")
    open_page(page, "/settings", "settings-page")
    tab = page.get_by_test_id(tab_test_id)
    expect(tab).to_be_visible()
    tab.click()
    expect(tab).to_be_visible()
