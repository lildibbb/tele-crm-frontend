from __future__ import annotations

import pytest
from playwright.sync_api import Page, expect

from tests.e2e.helpers.auth import login
from tests.e2e.helpers.navigation import open_page


@pytest.mark.parametrize("role", ["superadmin", "owner"])
@pytest.mark.smoke
@pytest.mark.journey
def test_leads_page_loads_and_search_works(page: Page, e2e_config, role: str) -> None:
    login(page, e2e_config, role)
    open_page(page, "/leads", "leads-page")

    search_input = page.get_by_test_id("leads-search")
    if search_input.count() == 0:
        search_input = page.locator(
            "input[type='search']:visible, "
            + "input[placeholder*='Search']:visible, "
            + "input[placeholder*='search']:visible, "
            + "input[placeholder*='name']:visible",
        ).first
    else:
        search_input = search_input.first
    expect(search_input).to_be_visible()
    search_input.fill("test")
    expect(search_input).to_have_value("test")

    clear_button = page.get_by_test_id("leads-search-clear")
    if clear_button.count() > 0:
        clear_button.click()
        expect(search_input).to_have_value("")


@pytest.mark.parametrize("tab_id", ["leads-status-ALL", "leads-status-NEW"])
@pytest.mark.journey
@pytest.mark.regression
def test_leads_status_tabs_clickable(page: Page, e2e_config, tab_id: str) -> None:
    login(page, e2e_config, "superadmin")
    open_page(page, "/leads", "leads-page")
    page.get_by_test_id(tab_id).click()
    expect(page.get_by_test_id(tab_id)).to_be_visible()
