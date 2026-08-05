#!/usr/bin/env python3
"""
Replace visible website copy:
  class          -> semi-private class
  classes        -> semi-private classes
  small class    -> semi-private class
  small classes  -> semi-private classes
  group class    -> semi-private class
  group classes  -> semi-private classes

Safety:
- Changes rendered text and user-facing attributes only.
- Does NOT alter HTML class="" attributes.
- Skips scripts, styles, code, templates, SVG, and comments.
- Skips already-correct "semi-private class(es)" wording.
- Preserves hyphenated adjectives such as "first-class."
- Defaults to a dry run.
- Creates .bak backups before writing.
"""

from __future__ import annotations

import argparse
import csv
import re
import shutil
import sys
from pathlib import Path

try:
    from bs4 import BeautifulSoup, Comment
except ImportError:
    print(
        "Missing dependency: beautifulsoup4\n"
        "Install it with: python -m pip install beautifulsoup4",
        file=sys.stderr,
    )
    raise SystemExit(2)

SKIP_TAGS = {
    "script", "style", "noscript", "template", "svg",
    "code", "pre", "textarea",
}
VISIBLE_ATTRIBUTES = ("alt", "title", "aria-label", "placeholder")
EXCLUDED_DIRS = {
    ".git", ".github", "node_modules", "vendor",
    "archive", "archives", "backup", "backups",
    "draft", "drafts", "staging",
}

# Match the requested phrases in longest-first form. The word-boundary logic
# avoids "classroom," CSS class names, and hyphenated "first-class."
TARGET_RE = re.compile(
    r"(?<![\w-])(?:(?:small|group)\s+)?class(?:es)?(?![\w-])",
    re.IGNORECASE,
)
ALREADY_CORRECT_RE = re.compile(r"(?:semi[-\s]private)\s*$", re.IGNORECASE)


def case_matched_replacement(original: str) -> str:
    plural = bool(re.search(r"classes$", original, re.IGNORECASE))
    replacement = "semi-private classes" if plural else "semi-private class"

    letters = "".join(ch for ch in original if ch.isalpha())
    if letters and letters.isupper():
        return replacement.upper()
    if original[:1].isupper():
        return replacement.title()
    return replacement


def replace_copy(text: str) -> tuple[str, int]:
    changes = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal changes
        prefix = text[max(0, match.start() - 32):match.start()]
        if ALREADY_CORRECT_RE.search(prefix):
            return match.group(0)

        changes += 1
        return case_matched_replacement(match.group(0))

    return TARGET_RE.sub(repl, text), changes


def is_excluded(path: Path, root: Path) -> bool:
    relative_parts = path.relative_to(root).parts
    return any(part.lower() in EXCLUDED_DIRS for part in relative_parts)


def is_in_testimonial(node) -> bool:
    p = node.parent
    while p is not None and getattr(p, "name", None) not in (None, "[document]"):
        classes = p.get("class", [])
        if not isinstance(classes, list):
            classes = [classes]
        if any("testimonial" in str(c).lower() or "quote" in str(c).lower() for c in classes):
            return True
        if "testimonial" in str(p.get("aria-label", "")).lower():
            return True
        p = p.parent
    return False


def iter_html_files(root: Path):
    for suffix in ("*.html", "*.htm"):
        for path in root.rglob(suffix):
            if not is_excluded(path, root) and not path.name.endswith(".bak"):
                yield path


def process_file(path: Path, *, write: bool, report_rows: list[dict]) -> int:
    original_html = path.read_text(encoding="utf-8")
    soup = BeautifulSoup(original_html, "html.parser")
    file_changes = 0

    # Rendered text nodes.
    for node in list(soup.find_all(string=True)):
        if isinstance(node, Comment):
            continue
        parent = node.parent
        if parent is None or parent.name in SKIP_TAGS:
            continue

        if is_in_testimonial(node):
            continue

        before = str(node)
        after, count = replace_copy(before)
        if count:
            node.replace_with(after)
            file_changes += count
            report_rows.append({
                "file": str(path),
                "location": f"text<{parent.name}>",
                "before": before.strip(),
                "after": after.strip(),
                "replacements": count,
            })

    # User-facing attributes only. Never touch class="", id="", href="", etc.
    for tag in soup.find_all(True):
        if tag.name in SKIP_TAGS:
            continue
        if is_in_testimonial(tag):
            continue
        for attr in VISIBLE_ATTRIBUTES:
            value = tag.get(attr)
            if not isinstance(value, str):
                continue
            after, count = replace_copy(value)
            if count:
                tag[attr] = after
                file_changes += count
                report_rows.append({
                    "file": str(path),
                    "location": f"{tag.name}[{attr}]",
                    "before": value,
                    "after": after,
                    "replacements": count,
                })

    if file_changes and write:
        backup = path.with_suffix(path.suffix + ".bak")
        if not backup.exists():
            shutil.copy2(path, backup)
        path.write_text(str(soup), encoding="utf-8")

    return file_changes


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Correct visible class/classes wording in deployed HTML."
    )
    parser.add_argument(
        "root",
        type=Path,
        help="Deployed site folder, for example ./public_html",
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="Write changes. Without this flag, the script performs a dry run.",
    )
    parser.add_argument(
        "--report",
        type=Path,
        default=Path("semi_private_copy_changes.csv"),
        help="CSV report path.",
    )
    args = parser.parse_args()

    root = args.root.expanduser().resolve()
    if not root.is_dir():
        print(f"Folder not found: {root}", file=sys.stderr)
        return 2

    report_rows: list[dict] = []
    files_changed = 0
    replacements = 0

    files = sorted(set(iter_html_files(root)))
    for path in files:
        count = process_file(path, write=args.write, report_rows=report_rows)
        if count:
            files_changed += 1
            replacements += count
            print(f"{'[WRITE]' if args.write else '[DRY RUN]'} {path}: {count}")

    report_path = args.report.expanduser().resolve()
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with report_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=("file", "location", "before", "after", "replacements"),
        )
        writer.writeheader()
        writer.writerows(report_rows)

    mode = "written" if args.write else "identified"
    print(
        f"\n{replacements} replacement(s) {mode} across "
        f"{files_changed} file(s).\nReport: {report_path}"
    )
    if not args.write:
        print(
            "\nReview the CSV, then rerun with --write.\n"
            "Example: python fix_semiprivate_copy.py ./public_html --write"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
