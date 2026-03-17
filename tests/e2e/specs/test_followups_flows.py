from __future__ import annotations

import pytest
from playwright.sync_api import Page, expect

from tests.e2e.helpers.auth import login
from tests.e2e.helpers.navigation import open_page


@pytest.mark.parametrize("role", ["superadmin", "owner"])
@pytest.mark.smoke
@pytest.mark.journey
def test_followups_page_loads(page: Page, e2e_config, role: str) -> None:
    login(page, e2e_config, role)
    open_page(page, "/follow-ups", "followups-page")
    scheduled_tab = page.get_by_test_id("followups-tab-scheduled")
    if scheduled_tab.count() > 0:
        expect(scheduled_tab.first).to_be_visible()
    else:
        expect(page.get_by_role("button", name="Scheduled").first).to_be_visible()


@pytest.mark.journey
@pytest.mark.regression
def test_followups_tab_switching(page: Page, e2e_config) -> None:
    login(page, e2e_config, "superadmin")
    open_page(page, "/follow-ups", "followups-page")

    failed_tab = page.get_by_test_id("followups-tab-failed")
    failed_tab.click()
    expect(page.get_by_test_id("followups-failed-panel")).to_be_visible(timeout=20_000)

    scheduled_tab = page.get_by_test_id("followups-tab-scheduled")
    scheduled_tab.click()
    expect(page.get_by_test_id("followups-scheduled-panel")).to_be_visible(timeout=20_000)
