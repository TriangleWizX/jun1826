#!/usr/bin/env bash
set -euo pipefail

HOST="senseisandy.com"
KEY="ch9sdfpu2ajh2rzbs1ed516zrfep9451"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

DRY_RUN="false"
SITEMAP_PATH="sitemap.xml"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    *)
      SITEMAP_PATH="$1"
      shift
      ;;
  esac
done

PAYLOAD="$(
python3 - "$SITEMAP_PATH" "$HOST" "$KEY" "$KEY_LOCATION" <<'PY'
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse

sitemap_path, host, key, key_location = sys.argv[1:5]

ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
namespace = ns["sm"]
urlset_tag = f"{{{namespace}}}urlset"
sitemapindex_tag = f"{{{namespace}}}sitemapindex"
root_dir = Path(sitemap_path).resolve().parent

urls = []
seen_urls = set()
visited_sitemaps = set()

def add_url(value: str):
    url = (value or "").strip()
    if not url:
        return
    if url in seen_urls:
        return
    seen_urls.add(url)
    urls.append(url)

def resolve_child_sitemap(loc_text: str) -> Path:
    loc = (loc_text or "").strip()
    if not loc:
        raise ValueError("Empty sitemap <loc> in sitemap index.")

    parsed = urlparse(loc)
    if not parsed.scheme or not parsed.netloc:
        raise ValueError(f"Sitemap index <loc> is not an absolute URL: {loc}")
    if parsed.netloc.lower() != host.lower():
        raise ValueError(f"Sitemap index <loc> host mismatch (expected {host}): {loc}")

    rel = (parsed.path or "").lstrip("/")
    if not rel:
        raise ValueError(f"Sitemap index <loc> path is empty: {loc}")

    child = (root_dir / rel).resolve()
    try:
        child.relative_to(root_dir)
    except ValueError as exc:
        raise ValueError(f"Sitemap index <loc> resolves outside root: {loc}") from exc
    return child

def collect_from_sitemap(file_path: Path):
    resolved = file_path.resolve()
    key_path = str(resolved)
    if key_path in visited_sitemaps:
        return
    visited_sitemaps.add(key_path)

    tree = ET.parse(resolved)
    root = tree.getroot()

    if root.tag == urlset_tag:
        for loc in root.findall("./sm:url/sm:loc", ns):
            if loc.text:
                add_url(loc.text)
        return

    if root.tag == sitemapindex_tag:
        for loc in root.findall("./sm:sitemap/sm:loc", ns):
            if not loc.text:
                continue
            child_path = resolve_child_sitemap(loc.text)
            collect_from_sitemap(child_path)
        return

    raise ValueError(f"Unsupported sitemap root tag in {resolved}: {root.tag}")

collect_from_sitemap(Path(sitemap_path))

payload = {
    "host": host,
    "key": key,
    "keyLocation": key_location,
    "urlList": urls,
}
print(json.dumps(payload, ensure_ascii=False))
PY
)"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "$PAYLOAD"
  exit 0
fi

curl -sS -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-binary "$PAYLOAD"
