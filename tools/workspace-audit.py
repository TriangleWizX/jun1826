#!/usr/bin/env python3
"""Read-only temporary workspace inventory audit; never prunes or deletes."""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import time
from datetime import date, timedelta
from pathlib import Path


ENV_MARKERS = {".venv", "venv", "env", "node_modules", "dist", "build"}
PROFILE_MARKERS = {"chrome-profile", "browser-profile", "browser-use-profile"}
PROJECT_MARKERS = {".git", "package.json", "pyproject.toml", "requirements.txt", "Pipfile"}
TEMP_PATH_PATTERN = re.compile(r"(?<![\w])/(?:tmp|var/tmp)/[^\s`|,;()]+")
LIFECYCLE_STATUS_PATTERN = re.compile(
    r"(?i)^(active|planned|retained|accepted|removed|preserve|complete)\b"
)


def directory_size(path: Path) -> int:
    total = 0
    for current, dirs, files in os.walk(path, followlinks=False):
        dirs[:] = [name for name in dirs if not (Path(current) / name).is_symlink()]
        for name in files:
            candidate = Path(current) / name
            try:
                if not candidate.is_symlink():
                    total += candidate.stat().st_size
            except OSError:
                continue
    return total


def human_size(size: int) -> str:
    amount = float(size)
    for unit in ("B", "KiB", "MiB", "GiB", "TiB"):
        if amount < 1024 or unit == "TiB":
            return f"{amount:.1f} {unit}"
        amount /= 1024


def likely_workspace(path: Path) -> bool:
    try:
        names = {child.name for child in path.iterdir()}
    except OSError:
        return False
    return bool(names & PROJECT_MARKERS) or any(marker in path.name.lower() for marker in ("style-", "workstream", "checkout", "workspace"))


def run_git(root: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(root), *args],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or f"git {args[0]} failed")
    return result.stdout


def inventory_preflight(root: Path, inventory: Path, max_review_days: int) -> list[str]:
    """Check lifecycle table rows before dispatch; report only, never mutate."""
    content = inventory.read_text(encoding="utf-8")
    issues: list[str] = []

    records = filter(
        None,
        run_git(root, "worktree", "list", "--porcelain").strip().split("\n\n"),
    )
    for record in records:
        fields = dict(
            line.split(" ", 1) for line in record.splitlines() if " " in line
        )
        raw = fields.get("worktree")
        if raw:
            if not Path(raw).exists():
                issues.append(f"registered worktree path missing: {raw}")

    # Only inspect Markdown table rows; prose can cite old evidence paths.
    for number, line in enumerate(content.splitlines(), 1):
        if not line.startswith("|") or "|" not in line[1:]:
            continue
        cells = [cell.strip().strip("`") for cell in line.strip().strip("|").split("|")]
        if len(cells) < 4 or cells[0] in {"DoD", "Workstream", "---"} or set(cells[0]) <= {"-", ":"}:
            continue

        status_match = LIFECYCLE_STATUS_PATTERN.match(cells[-1])
        paths = sorted(
            {Path(raw.rstrip(".:")) for raw in TEMP_PATH_PATTERN.findall(" ".join(cells))}
        )
        if not paths or not status_match:
            continue

        status = status_match.group(1).lower()
        if status == "preserve":
            status = "retained"
        elif status == "complete":
            status = "accepted"

        for path in paths:
            if status in {"active", "planned"}:
                issues.append(
                    f"inventory line {number}: unresolved {status} workspace {path}; "
                    "close it or mark retained with owner and review date"
                )

            if status == "retained":
                owner = cells[1] if len(cells) > 1 else ""
                if not owner or owner.lower() in {"owner", "coordinator?", "unknown", "unowned"}:
                    issues.append(f"inventory line {number}: retained workspace needs named owner: {path}")
                review = re.search(
                    r"(?i)\breview(?:\s+(?:by|date))?\s*[:=]?\s*(20\d{2}-\d{2}-\d{2})",
                    " ".join(cells),
                )
                if not review:
                    issues.append(f"inventory line {number}: retained workspace needs review date: {path}")
                else:
                    try:
                        due = date.fromisoformat(review.group(1))
                    except ValueError:
                        issues.append(f"inventory line {number}: invalid retained review date: {path}")
                    else:
                        if due < date.today():
                            issues.append(f"inventory line {number}: retained workspace review is overdue ({due}): {path}")
                        elif due > date.today() + timedelta(days=max_review_days):
                            issues.append(f"inventory line {number}: review date exceeds {max_review_days}-day limit ({due}): {path}")
                if not path.exists():
                    issues.append(f"inventory line {number}: retained workspace path absent; update status: {path}")

            if status == "removed" and path.exists():
                issues.append(f"inventory line {number}: removed workspace path still exists: {path}")

    return issues

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--inventory", type=Path, required=True)
    parser.add_argument("--temp-root", type=Path, default=Path("/tmp"), help="Root to inspect for likely project workspaces and heavyweight environment directories")
    parser.add_argument("--min-size-mib", type=int, default=128, help="Only report environment directories at least this large")
    parser.add_argument("--preflight", action="store_true", help="Fail closed on unresolved lifecycle entries before creating/dispatching temporary work")
    parser.add_argument("--max-review-days", type=int, default=7, help="Maximum future review horizon for retained workspaces")
    args = parser.parse_args()

    root = args.root.resolve()
    inventory = args.inventory if args.inventory.is_absolute() else root / args.inventory
    if not inventory.is_file():
        parser.error(f"inventory file not found: {inventory}")

    if args.preflight:
        print("Workspace lifecycle preflight (read-only)")
        issues = inventory_preflight(root, inventory, args.max_review_days)
        if issues:
            for issue in issues:
                print(f"BLOCK: {issue}")
            print("Resolve these rows before creating or dispatching another temporary workspace. No cleanup was performed.")
            return 2
        print("PASS: no unresolved active/planned rows, missing registered paths, or overdue retained reviews.")
        return 0

    print("Workspace audit (read-only)")
    print(f"Root: {root}")
    print(f"Inventory: {inventory}")
    print("Registered worktrees:")
    records = run_git(root, "worktree", "list", "--porcelain").strip().split("\n\n")
    for record in filter(None, records):
        fields = dict(line.split(" ", 1) for line in record.splitlines() if " " in line)
        path = Path(fields.get("worktree", ""))
        state = "present" if path.exists() else "MISSING PATH: review registration"
        branch = fields.get("branch", "detached")
        print(f"- {path} | {branch} | {state}")

    content = inventory.read_text(encoding="utf-8")
    mentioned = sorted(set(re.findall(r"(?<![\w])/(?:tmp|var/tmp)/[^\s`|,)]+", content)))
    print("Inventory path mentions:")
    if not mentioned:
        print("- none")
    for raw in mentioned:
        path = Path(raw.rstrip(".;"))
        print(f"- {path} | {'present' if path.exists() else 'absent: confirm closeout record'}")

    temp_root = args.temp_root.resolve()
    print(f"Temporary candidates under {temp_root} (review only):")
    if temp_root.is_dir():
        candidates: set[Path] = set()
        for current, dirs, _files in os.walk(temp_root, topdown=True, followlinks=False):
            current_path = Path(current)
            dirs[:] = [name for name in dirs if not (current_path / name).is_symlink()]
            for name in list(dirs):
                child = current_path / name
                relative_parts = child.relative_to(temp_root).parts
                nested_browser_cache = relative_parts[-2:] == ("playwright", ".local-browsers")
                is_workspace = len(relative_parts) == 1 and likely_workspace(child)
                is_environment = (
                    name in ENV_MARKERS
                    or name.lower() in PROFILE_MARKERS
                    or nested_browser_cache
                )
                if is_workspace or is_environment:
                    candidates.add(child)
                if is_environment or name == ".git":
                    # Avoid walking through bulky environments or Git internals.
                    dirs.remove(name)

        rows = []
        for path in sorted(candidates):
            size = directory_size(path)
            if size < args.min_size_mib * 1024 * 1024:
                continue
            try:
                age_days = max(0, int((time.time() - path.stat().st_mtime) / 86400))
            except OSError:
                age_days = -1
            rows.append((size, path, age_days))
        if rows:
            for size, path, age_days in sorted(rows, reverse=True):
                age = "unknown age" if age_days < 0 else f"directory timestamp {age_days}d"
                print(f"- {path} | {human_size(size)} | {age} | inspect ownership/processes before cleanup")
        else:
            print(f"- no likely candidates >= {args.min_size_mib} MiB")
    else:
        print("- temp root unavailable; skipped")
    usage = shutil.disk_usage(root)
    print(f"Disk: {usage.free / (1024**3):.1f} GiB free of {usage.total / (1024**3):.1f} GiB")
    print("Candidate discovery is heuristic. Directory timestamps are not proof of staleness. No cleanup or mutation was performed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
