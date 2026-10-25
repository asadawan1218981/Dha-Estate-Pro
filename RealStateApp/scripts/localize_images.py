#!/usr/bin/env python3
"""Localize all Unsplash images used by DHA Estate Pro.

- Downloads each unique Unsplash photo used in frontend + seed data.
- Compresses every image to LESS THAN 20 KB (fast rendering) with PIL:
  resize + JPEG quality loop, shrinking dimensions if needed.
- Saves to frontend/public/images/<photo-id>.jpg
- Rewrites every Unsplash URL in frontend + seed to the local path.
- Creates frontend/public/images/property-default.jpg (fallback image).

Run from the project root:  python3 scripts/localize_images.py
"""
import io
import os
import re
import sys
import urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "frontend", "public", "images")
MAX_BYTES = 20 * 1024  # 20 KB

URL_RE = re.compile(
    r"https://images\.unsplash\.com/photo-([A-Za-z0-9\-]+)\?[^\"'\s\)\]]*"
)

SEARCH_DIRS = [
    os.path.join(ROOT, "frontend", "app"),
    os.path.join(ROOT, "frontend", "components"),
    os.path.join(ROOT, "frontend", "store"),
    os.path.join(ROOT, "frontend", "lib"),
    os.path.join(ROOT, "backend", "src", "services"),
]

SOURCE_URL = "https://images.unsplash.com/photo-{pid}?auto=format&fit=crop&w=1200&q=70"


def find_ids():
    ids = set()
    files = []
    for d in SEARCH_DIRS:
        for base, _, names in os.walk(d):
            for n in names:
                if n.endswith((".jsx", ".js")):
                    files.append(os.path.join(base, n))
    for f in files:
        with open(f, encoding="utf-8", errors="ignore") as fh:
            ids.update(URL_RE.findall(fh.read()))
    return sorted(ids), files


def download(pid):
    req = urllib.request.Request(
        SOURCE_URL.format(pid=pid),
        headers={"User-Agent": "Mozilla/5.0 (DHA Estate Pro image localization)"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def compress_under_20kb(raw, max_width=900):
    """Return JPEG bytes < 20 KB, shrinking quality then dimensions."""
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    width, height = img.size
    if width > max_width:
        img = img.resize((max_width, int(height * max_width / width)), Image.LANCZOS)

    quality = 72
    while True:
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=quality, optimize=True)
        data = buf.getvalue()
        if len(data) < MAX_BYTES or quality <= 20:
            if len(data) >= MAX_BYTES:
                # Last resort: shrink dimensions and retry once more.
                w, h = img.size
                if w > 300:
                    img = img.resize((int(w * 0.7), int(h * 0.7)), Image.LANCZOS)
                    quality = 60
                    continue
            return data
        quality -= 8


def main():
    ids, files = find_ids()
    print(f"Found {len(ids)} unique Unsplash images in {len(files)} files")
    os.makedirs(OUT_DIR, exist_ok=True)

    report = []
    failed = []
    for pid in ids:
        try:
            raw = download(pid)
            data = compress_under_20kb(raw)
            out = os.path.join(OUT_DIR, f"{pid}.jpg")
            with open(out, "wb") as fh:
                fh.write(data)
            report.append((pid, len(data)))
            print(f"  {pid}.jpg -> {len(data) / 1024:.1f} KB")
        except Exception as exc:  # noqa: BLE001 - report and continue
            failed.append(pid)
            print(f"  FAILED {pid}: {exc}")

    # Default fallback image (used when a listing has no images).
    default_src = os.path.join(OUT_DIR, "1560448204-e02f11c3d0e2.jpg")
    default_dst = os.path.join(OUT_DIR, "property-default.jpg")
    if os.path.exists(default_src):
        with open(default_src, "rb") as fh:
            blob = fh.read()
        with open(default_dst, "wb") as fh:
            fh.write(blob)
        print(f"  property-default.jpg -> {len(blob) / 1024:.1f} KB")

    # Rewrite references: Unsplash URL -> local /images/<id>.jpg
    replaced_total = 0
    for f in files:
        with open(f, encoding="utf-8") as fh:
            content = fh.read()
        new_content, n = URL_RE.subn(r"/images/\1.jpg", content)
        if n:
            with open(f, "w", encoding="utf-8") as fh:
                fh.write(new_content)
            replaced_total += n
            print(f"  rewrote {n} URL(s) in {os.path.relpath(f, ROOT)}")

    over = [r for r in report if r[1] >= MAX_BYTES]
    print(f"\nDone: {len(report)} images localized, {replaced_total} references rewritten.")
    if over:
        print(f"WARNING: {len(over)} image(s) still >= 20 KB: {over}")
        return 1
    if failed:
        print(f"WARNING: {len(failed)} download(s) failed: {failed}")
        return 1
    print("All localized images are under 20 KB.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
