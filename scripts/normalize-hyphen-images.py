#!/usr/bin/env python3
"""Normalize Hyphen Weekend image pixels and reject orientation metadata."""
from pathlib import Path
import argparse
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1] / "src/assets/images/hyphen"
JPEG_NAMES = [
    "20251109_162043",
    "20230820_180830",
    "20260718_174246",
    "bottle-selection",
    "20230508_195151",
]


def normalized_copy(image: Image.Image) -> Image.Image:
    # exif_transpose applies the camera orientation and removes the tag.
    return ImageOps.exif_transpose(image)


def normalize() -> None:
    for stem in JPEG_NAMES:
        source = ROOT / f"{stem}.jpg"
        with Image.open(source) as image:
            upright = normalized_copy(image).convert("RGB")
            temp = source.with_suffix(".normalized.jpg")
            upright.save(temp, "JPEG", quality=88, optimize=True)
            temp.replace(source)
            webp = ROOT / f"{stem}.webp"
            upright.save(webp, "WEBP", quality=88, method=6)

    source = ROOT / "three-drinks.webp"
    with Image.open(source) as image:
        upright = image.rotate(180, expand=True)
        temp = ROOT / "three-drinks.normalized.webp"
        upright.save(temp, "WEBP", quality=88, method=6)
        temp.replace(source)


def verify() -> None:
    failures = []
    paths = [ROOT / f"{stem}.jpg" for stem in JPEG_NAMES] + [ROOT / "three-drinks.webp"]
    for path in paths:
        with Image.open(path) as image:
            orientation = image.getexif().get(274)
            if orientation not in (None, 1):
                failures.append(f"{path.name}: EXIF orientation {orientation}")
    if failures:
        raise SystemExit("\n".join(failures))
    print(f"Hyphen image orientation QA passed ({len(list(ROOT.glob('*.jpg')))} JPEGs checked)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if args.verify:
        verify()
    else:
        normalize()
        verify()
