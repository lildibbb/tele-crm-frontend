from __future__ import annotations

from typing import Any

from playwright.sync_api import Locator, Page, expect


def _first_visible(candidates: list[Locator], timeout_ms: int = 20_000) -> Locator:
    last_error: Exception | None = None
    per_locator_timeout = max(1_000, timeout_ms // max(1, len(candidates)))
    for locator in candidates:
        try:
            target = locator.first
            target.wait_for(state="visible", timeout=per_locator_timeout)
            return target
        except Exception as err:  # noqa: PERF203
            last_error = err
    raise AssertionError("Unable to find a visible login control from fallback selectors") from last_error


def login(page: Page, config: Any, role: str) -> None:
    page.goto("/login")
    page.wait_for_load_state("networkidle")

    if role == "superadmin":
        email = config.superadmin_email
        password = config.superadmin_password
    elif role == "owner":
        email = config.owner_email
        password = config.owner_password
    else:
        raise ValueError(f"Unsupported role: {role}")

    email_input = _first_visible(
        [
            page.get_by_test_id("login-email"),
            page.locator("input[name='email']"),
            page.locator("input[type='email']"),
            page.get_by_placeholder("Work email"),
            page.get_by_placeholder("Email"),
        ],
    )
    password_input = _first_visible(
        [
            page.get_by_test_id("login-password"),
            page.locator("input[name='password']"),
            page.locator("input[type='password']"),
            page.get_by_placeholder("Password"),
        ],
    )
    submit_button = _first_visible(
        [
            page.get_by_test_id("login-submit"),
            page.locator("button[type='submit']"),
            page.get_by_role("button", name="Sign in"),
            page.get_by_role("button", name="Login"),
            page.get_by_role("button", name="Log in"),
        ],
    )

    expect(email_input).to_be_visible(timeout=20_000)
    email_input.fill(email)
    password_input.fill(password)

    # Staging can render animated overlays; use multiple submit strategies.
    submit_button.click()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(600)
    if "/login" in page.url:
        try:
            page.keyboard.press("Enter")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(600)
        except Exception:
            pass
    if "/login" in page.url:
        form = page.locator("form").first
        if form.count() > 0:
            try:
                form.evaluate("f => f.requestSubmit()")
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(600)
            except Exception:
                pass

    if "/login" in page.url:
        error_text = ""
        error_candidates = [
            page.locator("[role='alert']").first,
            page.locator("[data-testid*='error']").first,
            page.locator("div:has-text('Invalid')").first,
            page.locator("div:has-text('incorrect')").first,
            page.locator("div:has-text('failed')").first,
        ]
        for candidate in error_candidates:
            if candidate.count() > 0:
                text = candidate.inner_text().strip()
                if text:
                    error_text = text
                    break
        raise AssertionError(
            f"Login did not leave /login for role '{role}'. "
            + (f"Visible error: {error_text}" if error_text else "No explicit error message found.")
        )


def logout_if_available(page: Page) -> None:
    profile_trigger = page.get_by_test_id("sidebar-user-menu-trigger")
    if profile_trigger.count() == 0:
        return
    profile_trigger.first.click()
    logout_item = page.get_by_test_id("sidebar-user-menu-logout")
    if logout_item.count() == 0:
        return
    logout_item.first.click()
    page.wait_for_load_state("networkidle")
