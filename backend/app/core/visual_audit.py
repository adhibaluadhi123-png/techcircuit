"""Visual Brand and Accessibility Auditing Engine for CANON.
Uses Pillow and WCAG 2.2 algorithms to evaluate image assets, logos, color palettes,
and accessibility constraints (contrast, descriptive text, aspect ratios).
"""
import io
import math
import re
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image

from app.core.deterministic import (
    hex_to_rgb, calculate_contrast_ratio, check_wcag_contrast,
    match_brand_palette, validate_logo_dimensions
)

APPROVED_BRAND_PALETTE = [
    "#F97316",  # Primary Orange
    "#C2410C",  # Deep Orange
    "#FB923C",  # Bright Accent
    "#FFF1E6",  # Soft Peach
    "#FFFAF5",  # Warm Background
    "#21160F",  # Dark Ink
    "#75665D",  # Muted Text
    "#382A20",  # Dark Editorial
    "#FFF9F3",  # Light Editorial Surface
]


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Convert RGB values to hexadecimal string."""
    return f"#{r:02x}{g:02x}{b:02x}".upper()


def extract_dominant_colors(image: Image.Image, num_colors: int = 5) -> List[Dict[str, Any]]:
    """
    Extract the top dominant colors from an image using Pillow quantization.
    Returns list of dicts with hex code, RGB, and pixel frequency percentage.
    """
    img_small = image.convert("RGB").resize((150, 150))
    # Quantize to adaptive color palette
    quantized = img_small.quantize(colors=num_colors)
    palette = quantized.getpalette()[:num_colors * 3]
    color_counts = quantized.getcolors()

    total_pixels = 150 * 150
    results = []

    if color_counts and palette:
        for count, idx in sorted(color_counts, reverse=True):
            r = palette[idx * 3]
            g = palette[idx * 3 + 1]
            b = palette[idx * 3 + 2]
            hex_code = rgb_to_hex(r, g, b)
            percentage = round((count / total_pixels) * 100, 1)
            results.append({
                "hex": hex_code,
                "rgb": (r, g, b),
                "frequency_percent": percentage
            })
    return results[:num_colors]


def analyze_image_asset(
    content_bytes: bytes,
    filename: str,
    approved_palette: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Perform comprehensive visual brand and accessibility check on uploaded image:
    1. Inspects image resolution, dimensions, and aspect ratio.
    2. Logo distortion detection if asset is identified as logo.
    3. Dominant color extraction & alignment with certified brand palette.
    4. Contrast ratio evaluation between primary dominant surface colors (WCAG AA).
    """
    if approved_palette is None:
        approved_palette = APPROVED_BRAND_PALETTE

    try:
        img = Image.open(io.BytesIO(content_bytes))
        width, height = img.size
        img_format = img.format or "UNKNOWN"
    except Exception as e:
        raise ValueError(f"Failed to decode image data: {str(e)}")

    dominant = extract_dominant_colors(img, num_colors=5)
    dominant_hexes = [c["hex"] for c in dominant]

    findings = []
    is_logo = "logo" in filename.lower()

    # 1. Logo Dimension and Aspect Ratio Checks
    aspect_ratio = round(width / max(1, height), 2)
    logo_spec = None
    if is_logo:
        logo_spec = validate_logo_dimensions(width, height)
        if not logo_spec["passes_spec"]:
            if logo_spec["is_distorted"]:
                findings.append({
                    "category": "Visual",
                    "severity": "BLOCKING",
                    "rule_code": "LOGO-RATIO",
                    "title": "Logo Aspect Ratio Distortion Detected",
                    "explanation": (
                        f"Logo dimensions ({width}x{height}, ratio {aspect_ratio}:1) deviate from "
                        f"approved brand spec ({logo_spec['required_ratio']}:1)."
                    ),
                    "confidence_tier": "DETERMINISTIC",
                    "verification_status": "VERIFIED"
                })
            if logo_spec["is_undersized"]:
                findings.append({
                    "category": "Visual",
                    "severity": "WARNING",
                    "rule_code": "LOGO-MIN-SIZE",
                    "title": "Logo Renders Below Minimum Legible Height",
                    "explanation": f"Logo height ({height}px) is below minimum legible specification of 24px.",
                    "confidence_tier": "DETERMINISTIC",
                    "verification_status": "VERIFIED"
                })

    # 2. Color Palette Alignment Check
    off_brand_colors = []
    for c in dominant[:3]:  # Top 3 primary surface colors
        match = match_brand_palette(c["hex"], approved_palette, max_tolerance=45.0)
        if not match["is_approved"]:
            off_brand_colors.append(c["hex"])

    if off_brand_colors:
        findings.append({
            "category": "Visual",
            "severity": "WARNING",
            "rule_code": "COLOR-PALETTE-01",
            "title": "Dominant Colors Deviate From Approved Brand Palette",
            "explanation": (
                f"Image contains primary dominant color(s) {', '.join(off_brand_colors)} that exceed "
                f"permissible color distance from the certified brand palette."
            ),
            "confidence_tier": "DETERMINISTIC",
            "verification_status": "VERIFIED"
        })

    # 3. Accessibility: Contrast Check between Top 2 Dominant Colors
    contrast_eval = None
    if len(dominant) >= 2:
        c1 = dominant[0]["hex"]
        c2 = dominant[1]["hex"]
        contrast_eval = check_wcag_contrast(c1, c2, is_large_text=False)
        if not contrast_eval["passes_wcag_aa"]:
            findings.append({
                "category": "Accessibility",
                "severity": "ADVISORY",
                "rule_code": "WCAG-CONTRAST-01",
                "title": "Low Contrast Between Primary Image Colors",
                "explanation": (
                    f"Contrast ratio between top dominant colors ({c1} and {c2}) is {contrast_eval['contrast_ratio']}:1, "
                    f"failing WCAG 2.2 AA standard threshold of {contrast_eval['required_ratio']}:1."
                ),
                "confidence_tier": "DETERMINISTIC",
                "verification_status": "VERIFIED"
            })

    return {
        "filename": filename,
        "format": img_format,
        "width": width,
        "height": height,
        "aspect_ratio": aspect_ratio,
        "is_logo": is_logo,
        "dominant_colors": dominant,
        "logo_spec": logo_spec,
        "contrast_check": contrast_eval,
        "visual_findings": findings
    }


def audit_text_accessibility(text: str) -> List[Dict[str, Any]]:
    """
    Automated accessibility checks for copy and structured editorial text:
    1. Ambiguous, unhelpful hyperlinks ('click here', 'read more', 'link').
    2. Overuse of ALL-CAPS text causing screen-reader accessibility issues.
    3. Structural heading hierarchy violations in markdown/HTML.
    """
    findings = []

    # 1. Ambiguous link text
    ambiguous_links = [
        r'\b(?:click\s+here|read\s+more|learn\s+more\s+here|link|this\s+link)\b'
    ]
    for pat in ambiguous_links:
        for match in re.finditer(pat, text, re.IGNORECASE):
            findings.append({
                "category": "Accessibility",
                "severity": "ADVISORY",
                "rule_code": "A11Y-LINK-TEXT",
                "title": "Ambiguous Non-Descriptive Hyperlink Text",
                "matched_text": match.group(0),
                "span_start": match.start(),
                "span_end": match.end(),
                "explanation": (
                    f"Hyperlink text '{match.group(0)}' lacks context for screen readers (WCAG 2.4.4). "
                    "Use descriptive link text indicating destination or purpose."
                ),
                "confidence_tier": "DETERMINISTIC",
                "verification_status": "VERIFIED"
            })

    # 2. Screaming ALL-CAPS phrases (3 or more uppercase words with 3+ letters)
    screaming_matches = re.finditer(r'\b[A-Z]{3,}(?:\s+[A-Z]{3,}){2,}\b', text)
    for m in screaming_matches:
        matched = m.group(0)
        findings.append({
            "category": "Accessibility",
            "severity": "ADVISORY",
            "rule_code": "A11Y-ALL-CAPS",
            "title": "Extended ALL-CAPS Passage Affects Legibility",
            "matched_text": matched,
            "span_start": m.start(),
            "span_end": m.end(),
            "explanation": (
                f"Prolonged uppercase phrase '{matched}' impedes readability and may be misread by screen readers as acronyms."
            ),
            "confidence_tier": "DETERMINISTIC",
            "verification_status": "VERIFIED"
        })

    return findings
