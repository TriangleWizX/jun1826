#!/usr/bin/env python3
"""Build copy/paste static and carousel packets from user-supplied images.

This tool deliberately does not create, resize, or render images. The manifest
is the editable source; generated packets are disposable review artifacts.
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import mimetypes
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PERSONAS = Path(__file__).with_name("personas.json")
CTA = "Comment START for the link."
PLATFORMS = {"facebook", "instagram"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


class ManifestError(ValueError):
    pass


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ManifestError(f"Cannot read JSON input {path}: {exc}") from exc


def resolve_image(raw: str, manifest_dir: Path) -> Path:
    if not isinstance(raw, str) or not raw.strip():
        raise ManifestError("image path must be a non-empty local path")
    candidate = Path(raw)
    options = [candidate] if candidate.is_absolute() else [ROOT / candidate, manifest_dir / candidate]
    for option in options:
        resolved = option.resolve()
        try:
            resolved.relative_to(ROOT)
        except ValueError:
            continue
        if resolved.exists() and resolved.is_file():
            if resolved.suffix.lower() not in IMAGE_EXTENSIONS:
                raise ManifestError(f"Unsupported image type: {raw}")
            return resolved
    raise ManifestError(f"Image does not exist inside the repository: {raw}")


def validate(data: dict, manifest_path: Path, personas_path: Path) -> list[dict]:
    if not isinstance(data, dict) or not isinstance(data.get("posts"), list):
        raise ManifestError("manifest must be an object with a posts array")
    personas = load_json(personas_path)
    if not isinstance(personas, dict):
        raise ManifestError("personas.json must contain an object")
    seen_ids: set[str] = set()
    seen_crossposts: set[str] = set()
    seen_images: set[Path] = set()
    normalized = []
    for index, post in enumerate(data["posts"], 1):
        if not isinstance(post, dict):
            raise ManifestError(f"posts[{index}] must be an object")
        post_id = post.get("id")
        if not isinstance(post_id, str) or not re.fullmatch(r"[a-z0-9][a-z0-9_-]*", post_id):
            raise ManifestError(f"posts[{index}] has an invalid id")
        if post_id in seen_ids:
            raise ManifestError(f"duplicate post id: {post_id}")
        seen_ids.add(post_id)
        kind = post.get("type")
        if kind not in {"static", "carousel"}:
            raise ManifestError(f"{post_id}: type must be static or carousel")
        avatar = post.get("avatar")
        if avatar not in personas:
            raise ManifestError(f"{post_id}: unknown avatar {avatar!r}")
        for field in ("theme", "description", "caption", "image_alt"):
            if not isinstance(post.get(field), str) or not post[field].strip():
                raise ManifestError(f"{post_id}: missing {field}")
        if CTA not in post["caption"]:
            raise ManifestError(f"{post_id}: caption must contain exact CTA: {CTA}")
        platforms = post.get("platforms", ["facebook", "instagram"])
        if not isinstance(platforms, list) or set(platforms) != PLATFORMS:
            raise ManifestError(f"{post_id}: platforms must be exactly facebook and instagram")
        crosspost = post.get("crosspost_key", post_id)
        if crosspost in seen_crossposts:
            raise ManifestError(f"duplicate crosspost_key: {crosspost}")
        seen_crossposts.add(crosspost)
        if kind == "static":
            raw_images = [{"image": post.get("image"), "text": post.get("image_text", ""), "alt": post["image_alt"]}]
        else:
            slides = post.get("slides")
            if not isinstance(slides, list) or len(slides) < 2:
                raise ManifestError(f"{post_id}: carousel needs at least 2 slides")
            raw_images = slides
        images = []
        for slide_index, slide in enumerate(raw_images, 1):
            if not isinstance(slide, dict):
                raise ManifestError(f"{post_id} slide {slide_index}: must be an object")
            image = resolve_image(slide.get("image"), manifest_path.parent)
            if image in seen_images and not post.get("allow_reused_image", False):
                raise ManifestError(f"image reused in more than one post: {image}")
            seen_images.add(image)
            alt = slide.get("alt", post["image_alt"])
            if not isinstance(alt, str) or not alt.strip():
                raise ManifestError(f"{post_id} slide {slide_index}: missing alt")
            images.append({"image": image, "text": str(slide.get("text", "")), "alt": alt})
        normalized.append({**post, "crosspost_key": crosspost, "platforms": platforms, "images": images, "avatar_name": personas[avatar].get("name", avatar)})
    return normalized


def relative_image(image: Path, output_dir: Path) -> str:
    return Path(*Path(__import__("os").path.relpath(image, output_dir)).parts).as_posix()


def write_outputs(data: dict, posts: list[dict], output_dir: Path, source: Path) -> None:
    output_dir.mkdir(parents=True)
    (output_dir / "validation.json").write_text(json.dumps({"valid": True, "post_count": len(posts), "source": str(source)}, indent=2) + "\n", encoding="utf-8")
    rows = []
    markdown = [f"# Post asset packets — {data.get('week', 'unspecified week')}", "", f"Source manifest: `{source}`", "", "Images are referenced from the supplied files. No image was generated or modified.", ""]
    cards = []
    for post in posts:
        markdown += [f"## {post['id']} — {post['theme']}", "", f"**Type:** {post['type']}  ", f"**Avatar:** {post['avatar_name']} (`{post['avatar']}`)  ", f"**Platforms:** Facebook + Instagram (one unique cross-post)  ", f"**Recommended dimensions:** 1080 × 1350 per image", "", "### Description", "", post["description"], "", "### Caption", "", "```text", post["caption"], "```", "", "### Image assets", ""]
        for number, slide in enumerate(post["images"], 1):
            label = f"Slide {number}" if post["type"] == "carousel" else "Image"
            markdown += [f"{label}: `{slide['image']}`  ", f"Alt text: {slide['alt']}  ", f"On-image text: {slide['text'] or '(none supplied)'}", ""]
            rows.append({"id": post["id"], "type": post["type"], "avatar": post["avatar"], "theme": post["theme"], "platforms": "facebook,instagram", "asset_order": number, "image": str(slide["image"]), "alt": slide["alt"]})
            src = html.escape(relative_image(slide["image"], output_dir), quote=True)
            cards.append(f'<figure><img src="{src}" alt="{html.escape(slide["alt"], quote=True)}"><figcaption>{label}: {html.escape(slide["text"] or slide["alt"])}</figcaption></figure>')
        markdown += ["### Copy/paste packet", "", "```text", post["caption"], "```", ""]
    (output_dir / "posts.md").write_text("\n".join(markdown), encoding="utf-8")
    with (output_dir / "manifest.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]) if rows else ["id"])
        writer.writeheader(); writer.writerows(rows)
    html_body = "\n".join(f"<article><h2>{html.escape(p['id'])} — {html.escape(p['theme'])}</h2><p><b>{html.escape(p['type'])}</b> · {html.escape(p['avatar_name'])}</p><p>{html.escape(p['description'])}</p><pre>{html.escape(p['caption'])}</pre><div class='assets'>{''.join(cards[i:i+len(p['images'])])}</div></article>" for i, p in zip(__import__('itertools').accumulate([0] + [len(p['images']) for p in posts[:-1]]), posts))
    (output_dir / "review.html").write_text("<!doctype html><meta charset='utf-8'><title>Ad Studio asset review</title><style>body{font:16px system-ui;max-width:1100px;margin:2rem auto;padding:0 1rem;background:#fbfaf8;color:#1f1712}article{background:white;padding:1rem;margin:1rem 0;border:1px solid #ddd}pre{white-space:pre-wrap;background:#f4f1ed;padding:1rem}.assets{display:flex;gap:1rem;flex-wrap:wrap}figure{margin:0;max-width:320px}img{display:block;max-width:100%;height:auto}figcaption{padding:.5rem 0}</style>" + html_body, encoding="utf-8")


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--week", help="optional output label, e.g. 2026-W40")
    args = parser.parse_args(argv)
    source = args.input.resolve()
    try:
        data = load_json(source)
        if args.week:
            data["week"] = args.week
        posts = validate(data, source, DEFAULT_PERSONAS)
        output = (args.output or ROOT / "tools/ads/output/post-assets" / data.get("week", "run")).resolve()
        if output.exists():
            raise ManifestError(f"output already exists; choose a new --output: {output}")
        write_outputs(data, posts, output, source)
    except ManifestError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    print(f"Wrote {len(posts)} post packets to {output}")
    print(f"Review: {output / 'review.html'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
