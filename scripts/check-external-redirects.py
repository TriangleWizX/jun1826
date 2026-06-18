#!/usr/bin/env python3
import argparse
import os
from dataclasses import dataclass
from typing import Iterable
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


SITE_ORIGIN = "https://senseisandy.com"
SITE_HOST = "senseisandy.com"


@dataclass(frozen=True)
class FoundUrl:
    url: str
    source_file: str


def iter_html_files(root: str) -> Iterable[str]:
    for dirpath, _, filenames in os.walk(root):
        if dirpath.startswith("./.git") or dirpath.startswith("./.vscode") or "/.vscode" in dirpath:
            continue
        for name in filenames:
            if name.endswith(".html"):
                yield os.path.join(dirpath, name)


def load_includes() -> tuple[str, str]:
    with open("nav-include.html", "r", encoding="utf-8") as f:
        nav_html = f.read()
    with open("footer-include.html", "r", encoding="utf-8") as f:
        footer_html = f.read()
    return nav_html, footer_html


def render_with_includes(path: str, nav_html: str, footer_html: str) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    html = html.replace('<!--#include virtual="/nav-include.html" -->', nav_html)
    html = html.replace('<!--#include virtual="/footer-include.html" -->', footer_html)
    return html


def is_external(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return False
    if not parsed.netloc:
        return False
    return parsed.netloc.lower() != SITE_HOST


def collect_external_urls() -> list[FoundUrl]:
    nav_html, footer_html = load_includes()
    found: list[FoundUrl] = []
    seen: set[str] = set()

    for path in iter_html_files("."):
        rel_path = os.path.relpath(path, ".")
        base_url = SITE_ORIGIN + "/"
        html = render_with_includes(path, nav_html, footer_html)
        soup = BeautifulSoup(html, "html.parser")

        for tag in soup.find_all(["a", "script", "link", "img", "iframe", "source"]):
            attr = "href" if tag.name in ("a", "link") else "src"
            raw = (tag.get(attr) or "").strip()
            if not raw or raw.startswith(("mailto:", "tel:", "sms:", "javascript:", "#", "data:")):
                continue

            absolute = urljoin(base_url, raw)
            if not is_external(absolute):
                continue
            if absolute in seen:
                continue
            seen.add(absolute)
            found.append(FoundUrl(url=absolute, source_file=rel_path))

    return found


def fetch_no_redirect(url: str, timeout_s: int) -> requests.Response:
    headers = {
        "User-Agent": "senseisandy-site-audit/1.0 (+https://senseisandy.com)",
        "Accept": "*/*",
    }
    try:
        return requests.head(url, allow_redirects=False, timeout=timeout_s, headers=headers)
    except requests.RequestException:
        return requests.get(url, allow_redirects=False, timeout=timeout_s, headers=headers, stream=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="List external URLs and optionally flag 3xx redirects.")
    parser.add_argument("--check", action="store_true", help="Make HTTP requests and print external 3xx redirects.")
    parser.add_argument("--timeout", type=int, default=12, help="Request timeout in seconds (default: 12).")
    args = parser.parse_args()

    urls = collect_external_urls()
    if not args.check:
        for item in urls:
            print(f"{item.url}\t# {item.source_file}")
        return

    for item in urls:
        try:
            resp = fetch_no_redirect(item.url, timeout_s=args.timeout)
        except Exception as e:
            print(f"ERROR\t{item.url}\t# {item.source_file}\t{e}")
            continue

        if resp.status_code in (301, 302, 303, 307, 308):
            location = resp.headers.get("Location", "")
            print(f"{resp.status_code}\t{item.url}\t->\t{location}\t# {item.source_file}")


if __name__ == "__main__":
    main()

