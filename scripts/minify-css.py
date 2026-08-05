#!/usr/bin/env python3
"""Compatibility entrypoint for the canonical CSS minifier.

Keep one implementation of CSS parsing rules. The former Python regex
minifier removed semantic selector whitespace, so all writes now delegate to
the conservative Node implementation used by the build and QA commands.
"""

from pathlib import Path
import subprocess
import sys


def main() -> None:
    unsupported = [argument for argument in sys.argv[1:] if argument != "--check"]
    if unsupported:
        raise SystemExit(
            "scripts/minify-css.py now supports only --check; "
            "use npm run styles:min for one-time generation."
        )

    root = Path(__file__).resolve().parents[1]
    subprocess.run(
        ["node", str(root / "tools" / "minify-css.mjs"), *sys.argv[1:]],
        cwd=root,
        check=True,
    )


if __name__ == "__main__":
    main()
