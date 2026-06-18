#!/usr/bin/env python3
"""Fail if inline offer blocks appear outside offer-block.html."""
from __future__ import annotations

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {ROOT / "offer-block.html"}

PATTERNS = [
    re.compile(r"<!--\s*OFFER_BLOCK_START\s*-->", re.IGNORECASE),
    re.compile(r"<!--\s*OFFER_BLOCK_END\s*-->", re.IGNORECASE),
    re.compile(r"<section\s+class=\"offer-block\"", re.IGNORECASE),
    re.compile(r"offer-block__", re.IGNORECASE),
]


def scan_file(path: Path) -> list[tuple[int, str]]:
    matches: list[tuple[int, str]] = []
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return matches

    lines = text.splitlines()
    for i, line in enumerate(lines, start=1):
        if any(p.search(line) for p in PATTERNS):
            matches.append((i, line.strip()))
    return matches


def main() -> int:
    offenders: dict[Path, list[tuple[int, str]]] = {}
    for path in ROOT.rglob("*.html"):
        if path in EXCLUDE:
            continue
        hits = scan_file(path)
        if hits:
            offenders[path] = hits

    if not offenders:
        print("OK: no inline offer blocks found.")
        return 0

    print("Inline offer block markup found (use /offer-block.html include instead):")
    for path, hits in sorted(offenders.items()):
        rel = path.relative_to(ROOT)
        print(f"- {rel}")
        for line_no, snippet in hits[:5]:
            print(f"  L{line_no}: {snippet}")
        if len(hits) > 5:
            print(f"  ... {len(hits) - 5} more")
    return 1


if __name__ == "__main__":
    sys.exit(main())
