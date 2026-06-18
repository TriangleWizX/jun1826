#!/usr/bin/env python3
import argparse
import re
import time
from pathlib import Path


def minify_css(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{}:;,>])\s*", r"\1", css)
    css = re.sub(r";}", "}", css)
    return css.strip() + "\n"


def write_minified(source_path: Path, out_path: Path) -> None:
    css = source_path.read_text(encoding="utf-8")
    out_path.write_text(minify_css(css), encoding="utf-8")
    print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")

def write_all_minified() -> None:
    jobs = (
        (Path("assets/css/styles.css"), Path("assets/css/styles.min.css")),
        (Path("assets/css/ss.css"), Path("assets/css/ss.min.css")),
        (Path("assets/css/bjj-glossary.css"), Path("assets/css/bjj-glossary.min.css")),
        (Path("assets/css/global.css"), Path("assets/css/global.min.css")),
        (Path("assets/css/components.css"), Path("assets/css/components.min.css")),
        (Path("assets/css/pages/home.css"), Path("assets/css/pages/home.min.css")),
        (Path("assets/css/pages/schedule.css"), Path("assets/css/pages/schedule.min.css")),
        (Path("assets/css/pages/kids.css"), Path("assets/css/pages/kids.min.css")),
        (Path("assets/css/pages/teens.css"), Path("assets/css/pages/teens.min.css")),
        (Path("assets/css/pages/adults.css"), Path("assets/css/pages/adults.min.css")),
        (Path("assets/css/pages/student-hub.css"), Path("assets/css/pages/student-hub.min.css")),
        (Path("assets/css/pages/glossary.css"), Path("assets/css/pages/glossary.min.css")),
        (Path("assets/css/pages/pricing.css"), Path("assets/css/pages/pricing.min.css")),
        (Path("assets/css/pages/private-lessons.css"), Path("assets/css/pages/private-lessons.min.css")),
        (Path("assets/css/pages/near.css"), Path("assets/css/pages/near.min.css")),
    )
    for source_path, out_path in jobs:
        write_minified(source_path, out_path)


def watch(source_path: Path, out_path: Path, interval: float) -> None:
    last_mtime = None
    print(f"Watching {source_path} for changes...")
    try:
        while True:
            if source_path.exists():
                current_mtime = source_path.stat().st_mtime
                if last_mtime is None or current_mtime != last_mtime:
                    write_minified(source_path, out_path)
                    last_mtime = current_mtime
            time.sleep(interval)
    except KeyboardInterrupt:
        print("Stopped watching.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Minify canonical CSS sources into *.min.css outputs."
    )
    parser.add_argument(
        "--watch",
        "-w",
        action="store_true",
        help="Watch styles.css for changes and keep styles.min.css in sync.",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=0.5,
        help="Polling interval in seconds when using --watch.",
    )
    args = parser.parse_args()

    if args.watch:
        source_path = Path("assets/css/styles.css")
        out_path = Path("assets/css/styles.min.css")
        watch(source_path, out_path, args.interval)
        return

    write_all_minified()


if __name__ == "__main__":
    main()
