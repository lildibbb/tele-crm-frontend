from __future__ import annotations

import json
from html import escape
from pathlib import Path
from typing import Any


def write_json_summary(summary: dict[str, Any], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(summary, indent=2), encoding="utf-8")


def write_html_summary(summary: dict[str, Any], path: Path) -> None:
    rows = "\n".join(
        f"<tr><td>{escape(item['nodeid'])}</td><td>{escape(item['outcome'])}</td><td>{item['duration']:.3f}</td><td>{escape(','.join(item['markers']))}</td></tr>"
        for item in summary.get("results", [])
    )
    html = f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>E2E Summary {escape(summary.get("runId", ""))}</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 24px; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ border: 1px solid #ddd; padding: 8px; font-size: 12px; }}
    th {{ background: #f5f5f5; text-align: left; }}
  </style>
</head>
<body>
  <h1>E2E Run Summary</h1>
  <p><strong>Run ID:</strong> {escape(summary.get("runId", ""))}</p>
  <p><strong>Base URL:</strong> {escape(summary.get("baseUrl", ""))}</p>
  <p><strong>Total:</strong> {summary.get("total", 0)} |
     <strong>Passed:</strong> {summary.get("passed", 0)} |
     <strong>Failed:</strong> {summary.get("failed", 0)} |
     <strong>Skipped:</strong> {summary.get("skipped", 0)}
  </p>
  <table>
    <thead>
      <tr><th>Test</th><th>Outcome</th><th>Duration (s)</th><th>Markers</th></tr>
    </thead>
    <tbody>{rows}</tbody>
  </table>
</body>
</html>
"""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html, encoding="utf-8")
