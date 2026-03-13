from __future__ import annotations

import pytest
from playwright.sync_api import Page, expect

from tests.e2e.helpers.auth import login
from tests.e2e.helpers.crawl import (
    CrawlTarget,
    discover_safe_controls,
    probe_safe_interactions,
    write_crawl_report,
)


@pytest.mark.crawl
@pytest.mark.regression
def test_ui_crawl_safe_controls(page: Page, e2e_config) -> None:
    login(page, e2e_config, "superadmin")

    targets = [
        CrawlTarget("/leads", "leads-page"),
        CrawlTarget("/follow-ups", "followups-page"),
        CrawlTarget("/broadcasts", "broadcasts-page"),
        CrawlTarget("/settings", "settings-page"),
    ]

    for target in targets:
        page.goto(target.path)
        page.wait_for_load_state("networkidle")
        expect(page.get_by_test_id(target.root_test_id)).to_be_visible(timeout=20_000)
        controls = discover_safe_controls(page)
        interactions = probe_safe_interactions(page, max_clicks=25)
        write_crawl_report(
            e2e_config.report_dir / f"crawl-{target.path.strip('/').replace('/', '-')}.json",
            target.path,
            controls,
            interactions,
        )

        successful = sum(1 for i in interactions if i["result"] == "clicked")
        assert successful >= 1, f"No successful safe clicks on {target.path}"
