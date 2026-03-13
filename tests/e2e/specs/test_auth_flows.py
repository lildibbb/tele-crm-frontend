from __future__ import annotations

import pytest
from playwright.sync_api import Page, expect

from tests.e2e.helpers.auth import login


@pytest.mark.parametrize("role", ["superadmin", "owner"])
@pytest.mark.smoke
@pytest.mark.journey
def test_login_journey(page: Page, e2e_config, role: str) -> None:
    login(page, e2e_config, role)
    sidebar = page.get_by_test_id("app-sidebar")
    if sidebar.count() > 0:
        expect(sidebar.first).to_be_visible(timeout=20_000)
    else:
        assert "/login" not in page.url


@pytest.mark.smoke
@pytest.mark.journey
def test_login_form_elements_visible(page: Page) -> None:
    page.goto("/login")
    page.wait_for_load_state("networkidle")

    form = page.get_by_test_id("login-form")
    if form.count() > 0:
        expect(form.first).to_be_visible()
    else:
        expect(page.locator("form").first).to_be_visible()

    email = page.get_by_test_id("login-email")
    if email.count() > 0:
        expect(email.first).to_be_visible()
    else:
        expect(page.locator("input[type='email'], input[name='email']").first).to_be_visible()

    password = page.get_by_test_id("login-password")
    if password.count() > 0:
        expect(password.first).to_be_visible()
    else:
        expect(page.locator("input[type='password'], input[name='password']").first).to_be_visible()

    submit = page.get_by_test_id("login-submit")
    if submit.count() > 0:
        expect(submit.first).to_be_visible()
    else:
        expect(page.locator("button[type='submit']").first).to_be_visible()
