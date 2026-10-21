"""Asset Storage, File Sanitization, Image Metadata, and WCAG Contrast Utilities.
Handles secure multi-tenant file persistence, SVG sanitization, and deterministic visual checks.
"""
import io
import os
import re
from pathlib import Path
from typing import Tuple, Dict, Any, Optional
from PIL import Image
from app.config import settings


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename against path traversal attacks, null bytes,
    and dangerous characters while preserving the extension.
    """
    if not filename:
        return "asset.bin"

    # Remove path separators and null bytes
    clean = re.sub(r"[\\/\0]", "", filename).strip()
    # Replace whitespace and unsafe characters with underscores
    clean = re.sub(r"[^\w\.\-\_]", "_", clean)
    # Ensure it doesn't start with a dot or dash
    clean = re.sub(r"^[.\-]+", "", clean)
    if not clean:
        clean = "asset.bin"
    return clean[:120]


def sanitize_svg(content_bytes: bytes) -> bytes:
    """
    Sanitize SVG markup against Stored XSS and XML External Entity (XXE) injection.
    Strips script tags, event handlers, foreignObject, and javascript links.
    """
    try:
        text = content_bytes.decode("utf-8", errors="replace")
    except Exception:
        return content_bytes

    # Strip XML DOCTYPE and ENTITY declarations to eliminate XXE
    text = re.sub(r"<!DOCTYPE[^>]*>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<!ENTITY[^>]*>", "", text, flags=re.IGNORECASE)

    # Strip <script>...</script> blocks
    text = re.sub(r"<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>", "", text, flags=re.IGNORECASE)

    # Strip <foreignObject> blocks
    text = re.sub(r"<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>", "", text, flags=re.IGNORECASE)

    # Strip inline event handlers: onload, onerror, onclick, onmouseover, etc.
    text = re.sub(r"\bon\w+\s*=\s*(?:'[^']*'|\"[^\"]*\"|[^\s>]+)", "", text, flags=re.IGNORECASE)

    # Strip javascript: pseudo-protocols
    text = re.sub(r"href\s*=\s*[\"']javascript:[^\"']*[\"']", "href=\"#\"", text, flags=re.IGNORECASE)
    text = re.sub(r"xlink:href\s*=\s*[\"']javascript:[^\"']*[\"']", "xlink:href=\"#\"", text, flags=re.IGNORECASE)

    return text.encode("utf-8")


def get_asset_storage_path(workspace_id: str, asset_id: str, filename: str) -> Path:
    """Resolve storage path scoped strictly within workspace storage directory."""
    clean_ws = sanitize_filename(workspace_id)
    clean_fn = sanitize_filename(filename)
    ws_dir = Path(settings.STORAGE_DIR) / "assets" / clean_ws
    ws_dir.mkdir(parents=True, exist_ok=True)
    return ws_dir / f"{asset_id}_{clean_fn}"


def extract_image_metadata(content_bytes: bytes, ext: str) -> Dict[str, Any]:
    """Extract width, height, aspect ratio, and format from image bytes."""
    meta: Dict[str, Any] = {
        "width": None,
        "height": None,
        "aspect_ratio": None,
        "format": ext.upper()
    }

    if ext.lower() == "svg":
        # Extract width/height/viewBox from SVG text
        try:
            svg_text = content_bytes.decode("utf-8", errors="replace")
            vb_match = re.search(r'viewBox\s*=\s*["\']([\d\.\s\-]+)["\']', svg_text, re.IGNORECASE)
            if vb_match:
                parts = [float(p) for p in vb_match.group(1).split() if p.strip()]
                if len(parts) == 4 and parts[3] > 0:
                    meta["width"] = int(parts[2])
                    meta["height"] = int(parts[3])
                    meta["aspect_ratio"] = round(parts[2] / parts[3], 2)
            else:
                w_m = re.search(r'width\s*=\s*["\'](\d+(?:\.\d+)?)["\']', svg_text, re.IGNORECASE)
                h_m = re.search(r'height\s*=\s*["\'](\d+(?:\.\d+)?)["\']', svg_text, re.IGNORECASE)
                if w_m and h_m:
                    w = float(w_m.group(1))
                    h = float(h_m.group(1))
                    if h > 0:
                        meta["width"] = int(w)
                        meta["height"] = int(h)
                        meta["aspect_ratio"] = round(w / h, 2)
        except Exception:
            pass
        return meta

    # For binary raster images (PNG, JPG, WEBP)
    try:
        with Image.open(io.BytesIO(content_bytes)) as img:
            w, h = img.size
            meta["width"] = w
            meta["height"] = h
            meta["format"] = img.format or ext.upper()
            if h > 0:
                meta["aspect_ratio"] = round(w / h, 2)
    except Exception:
        pass

    return meta


# ─────────────────────────────────────────────────────────────────────────────
# WCAG Contrast Calculation Helpers
# ─────────────────────────────────────────────────────────────────────────────

def hex_to_rgb(hex_str: str) -> Tuple[int, int, int]:
    """Convert HEX color string (#RRGGBB or #RGB) to (r, g, b)."""
    clean = hex_str.strip().lstrip("#")
    if len(clean) == 3:
        clean = "".join(c * 2 for c in clean)
    if len(clean) != 6:
        return (0, 0, 0)
    try:
        return (int(clean[0:2], 16), int(clean[2:4], 16), int(clean[4:6], 16))
    except ValueError:
        return (0, 0, 0)


def calculate_relative_luminance(rgb: Tuple[int, int, int]) -> float:
    """Calculate WCAG 2.1 relative luminance for an RGB tuple."""
    normalized = [c / 255.0 for c in rgb]
    transformed = [
        c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
        for c in normalized
    ]
    return 0.2126 * transformed[0] + 0.7152 * transformed[1] + 0.0722 * transformed[2]


def calculate_contrast_ratio(hex1: str, hex2: str) -> float:
    """Calculate WCAG contrast ratio between two hex colors."""
    rgb1 = hex_to_rgb(hex1)
    rgb2 = hex_to_rgb(hex2)
    l1 = calculate_relative_luminance(rgb1)
    l2 = calculate_relative_luminance(rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    ratio = (lighter + 0.05) / (darker + 0.05)
    return round(ratio, 2)


def evaluate_color_accessibility(hex_val: str) -> Dict[str, Any]:
    """
    Evaluate WCAG compliance of a color against standard white (#FFFFFF)
    and deep dark canvas (#201815 / #1E1B4B).
    """
    rgb = hex_to_rgb(hex_val)
    contrast_on_white = calculate_contrast_ratio(hex_val, "#FFFFFF")
    contrast_on_dark = calculate_contrast_ratio(hex_val, "#201815")

    # Higher contrast background is the recommended pairing
    best_bg = "#FFFFFF" if contrast_on_white >= contrast_on_dark else "#201815"
    best_ratio = max(contrast_on_white, contrast_on_dark)

    passes_aa_normal = best_ratio >= 4.5
    passes_aa_large = best_ratio >= 3.0
    passes_aaa = best_ratio >= 7.0

    rating = "FAIL"
    if passes_aaa:
        rating = "AAA"
    elif passes_aa_normal:
        rating = "AA"
    elif passes_aa_large:
        rating = "AA Large"

    return {
        "rgb": f"rgb({rgb[0]}, {rgb[1]}, {rgb[2]})",
        "rgb_values": list(rgb),
        "contrast_on_white": contrast_on_white,
        "contrast_on_dark": contrast_on_dark,
        "recommended_bg": best_bg,
        "best_contrast_ratio": best_ratio,
        "passes_aa_normal": passes_aa_normal,
        "passes_aa_large": passes_aa_large,
        "passes_aaa": passes_aaa,
        "wcag_rating": rating
    }
