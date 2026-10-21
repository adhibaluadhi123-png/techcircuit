"""Deterministic Rule Engine for CANON Brand Governance.
Handles exact checks with zero LLM hallucinations:
- Terminology & Banned phrases
- WCAG AA contrast ratio calculations
- Brand palette hex matching
- Flesch Reading Ease & sentence length
"""
import math
import re
from typing import List, Dict, Any, Tuple, Optional


def check_terminology_rules(
    text: str,
    rules: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Execute deterministic terminology and banned-phrase rules against input text.
    Returns structured candidate findings with exact spans.
    """
    findings = []
    
    ALLOWED_CATEGORIES = {
        "Terminology", "Claims", "Formatting", "Brand Naming", "Brand Naming & Trademarks",
        "Logo & Identity", "Logo & Visual Identity", "Logo Usage", "Packaging",
        "Trademark", "Color & Visual", "Visual", "Brand Voice", "Product Claims"
    }

    for rule in rules:
        if rule.get("enforcement_type") != "DETERMINISTIC":
            continue
        category = rule.get("category", "")
        if category and category not in ALLOWED_CATEGORIES:
            continue
            
        pattern = rule.get("pattern")
        fail_example = rule.get("fail_example", "")
        
        # Explicit canonical patterns for core deterministic brand rules
        if not pattern:
            rule_code = rule.get("rule_code")
            if rule_code == "TERM-01":
                pattern = r"\b(?:Legacy\s+Cloud|Apex\s+Cloud)\b"
            elif rule_code == "TERM-02":
                pattern = r"\b(?:100%\s+uptime\s+guaranteed|guaranteed\s+100%\s+uptime)\b"
            elif rule_code == "NAME-01":
                pattern = r"\b(?:cloudplatform|Cloud\s+platform|cloud\s+platform|apexdynamics|Apex\s+dynamics|apex\s+dynamics)\b"
            elif rule_code == "TM-01":
                pattern = r"\b(?:CloudPlatform|ApexDynamics|Apex\s+Core)(?![®™\u00AE\u2122])\b"
            elif rule_code == "CLAIM-01":
                pattern = r"\b(?:fastest\s+platform\s+in\s+the\s+world|undisputed\s+leader)\b"
            elif rule_code == "LOGO-01":
                pattern = r"\b(?:crowded\s+logo|unapproved\s+logo\s+variant|altered\s+logomark)\b"
            elif rule_code == "LOGO-02":
                pattern = r"\b(?:distorted\s+logo|recolored\s+logo|drop\s+shadow\s+on\s+logo)\b"

        # If no explicit regex pattern is provided, extract quoted terms or keywords from title/description
        if not pattern:
            # Check for quoted phrases in title or description (e.g. 'Apex Cloud', '100% uptime guaranteed')
            full_context = f"{rule.get('title', '')} {rule.get('description', '')}"
            quoted_phrases = re.findall(r"['\"]([^'\"]{3,40})['\"]", full_context)
            # Filter out non-prohibited quoted terms (like 'Apex Core' which is the pass example)
            pass_ex = rule.get("pass_example", "")
            prohibited_candidates = [p for p in quoted_phrases if p.lower() not in pass_ex.lower()]
            
            if prohibited_candidates:
                sub_patterns = [re.escape(p.strip()) for p in prohibited_candidates]
                pattern = rf"\b(?:{'|'.join(sub_patterns)})\b"
            elif fail_example and len(fail_example.strip()) <= 40:
                clean_phrase = re.escape(fail_example.strip())
                pattern = rf"\b{clean_phrase}\b"
            
        if not pattern:
            continue
            
        flags = 0 if rule.get("rule_code") == "NAME-01" else re.IGNORECASE
        try:
            regex = re.compile(pattern, flags)
            for match in regex.finditer(text):
                # Extract concise surgical correction term if available
                suggested = rule.get("pass_example") or None
                full_pass_context = f"{rule.get('title', '')} {rule.get('description', '')} {rule.get('pass_example', '')}"
                quoted_pass = re.findall(r"['\"]([^'\"]{3,40})['\"]", full_pass_context)
                approved_candidates = [p for p in quoted_pass if p.lower() in (rule.get("pass_example") or "").lower()]
                if approved_candidates:
                    suggested = approved_candidates[0]

                findings.append({
                    "rule_id": rule.get("id"),
                    "rule_code": rule.get("rule_code"),
                    "category": rule.get("category"),
                    "severity": rule.get("severity", "BLOCKING"),
                    "span_start": match.start(),
                    "span_end": match.end(),
                    "matched_text": match.group(0),
                    "source_quote": rule.get("source_quote"),
                    "source_section": rule.get("source_section"),
                    "explanation": f"Found prohibited terminology '{match.group(0)}'. Guideline requires: {rule.get('description')}",
                    "evidence_status": "VERIFIED",
                    "confidence_tier": "DETERMINISTIC",
                    "suggested_correction": suggested,
                    "verification_status": "VERIFIED"
                })
        except Exception:
            continue
            
    return findings


# =========================================================================
# WCAG AA Color Contrast & Hex Palette Verification
# =========================================================================

def hex_to_rgb(hex_code: str) -> Tuple[int, int, int]:
    """Convert hex color string to RGB tuple."""
    hex_clean = hex_code.lstrip("#")
    if len(hex_clean) == 3:
        hex_clean = "".join([c*2 for c in hex_clean])
    if len(hex_clean) != 6:
        raise ValueError(f"Invalid hex color: {hex_code}")
    return tuple(int(hex_clean[i:i+2], 16) for i in (0, 2, 4))  # type: ignore

def get_relative_luminance(rgb: Tuple[int, int, int]) -> float:
    """Calculate WCAG relative luminance."""
    sRGB = [v / 255.0 for v in rgb]
    linear = []
    for c in sRGB:
        if c <= 0.04045:
            linear.append(c / 12.92)
        else:
            linear.append(((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

def calculate_contrast_ratio(hex1: str, hex2: str) -> float:
    """Calculate contrast ratio between two hex colors (WCAG 2.1)."""
    rgb1 = hex_to_rgb(hex1)
    rgb2 = hex_to_rgb(hex2)
    l1 = get_relative_luminance(rgb1)
    l2 = get_relative_luminance(rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return round((lighter + 0.05) / (darker + 0.05), 2)

def check_wcag_contrast(fg_hex: str, bg_hex: str, is_large_text: bool = False) -> Dict[str, Any]:
    """
    Check WCAG AA compliance:
    Normal text: >= 4.5:1
    Large text (>= 18pt / 14pt bold): >= 3.0:1
    """
    ratio = calculate_contrast_ratio(fg_hex, bg_hex)
    threshold = 3.0 if is_large_text else 4.5
    passes = ratio >= threshold
    return {
        "foreground": fg_hex,
        "background": bg_hex,
        "contrast_ratio": ratio,
        "required_ratio": threshold,
        "passes_wcag_aa": passes,
        "level": "AA" if passes else "FAIL"
    }

def color_distance_rgb(hex1: str, hex2: str) -> float:
    """Euclidean distance in RGB color space."""
    r1, g1, b1 = hex_to_rgb(hex1)
    r2, g2, b2 = hex_to_rgb(hex2)
    return math.sqrt((r1 - r2)**2 + (g1 - g2)**2 + (b1 - b2)**2)

def match_brand_palette(target_hex: str, approved_palette: List[str], max_tolerance: float = 35.0) -> Dict[str, Any]:
    """
    Check if a color belongs to or closely matches an approved brand palette.
    """
    closest_color = None
    min_dist = float("inf")
    
    for approved in approved_palette:
        dist = color_distance_rgb(target_hex, approved)
        if dist < min_dist:
            min_dist = dist
            closest_color = approved
            
    is_exact = min_dist == 0.0
    is_acceptable = min_dist <= max_tolerance
    
    return {
        "target_color": target_hex,
        "closest_approved": closest_color,
        "distance": round(min_dist, 2),
        "is_exact_match": is_exact,
        "is_approved": is_acceptable
    }


# =========================================================================
# Readability & Structural Metrics
# =========================================================================

def count_syllables(word: str) -> int:
    """Basic English syllable counter heuristic."""
    word = word.lower().strip(".:;?!")
    if not word:
        return 0
    if len(word) <= 3:
        return 1
    word = re.sub(r'(?:[^laeiouy]|ed|es|e)$', '', word)
    word = re.sub(r'^y', '', word)
    matches = re.findall(r'[aeiouy]{1,2}', word)
    return max(1, len(matches))

def calculate_readability_metrics(text: str) -> Dict[str, Any]:
    """
    Calculate Flesch Reading Ease & basic linguistic properties:
    Score = 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
    """
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    words = [w for w in re.findall(r'\b[A-Za-z0-9\'-]+\b', text)]
    
    total_sentences = max(1, len(sentences))
    total_words = max(1, len(words))
    total_syllables = sum(count_syllables(w) for w in words)
    
    avg_sentence_len = total_words / total_sentences
    avg_syllables_per_word = total_syllables / total_words
    
    flesch_score = 206.835 - (1.015 * avg_sentence_len) - (84.6 * avg_syllables_per_word)
    flesch_score = round(max(0.0, min(100.0, flesch_score)), 1)
    
    return {
        "word_count": total_words,
        "sentence_count": total_sentences,
        "average_sentence_length": round(avg_sentence_len, 1),
        "flesch_reading_ease": flesch_score,
        "reading_level": "Easy" if flesch_score >= 70 else ("Standard" if flesch_score >= 50 else "Difficult")
    }


# =========================================================================
# Brand Asset, Logo Geometry & Trademark Compliance
# =========================================================================

def validate_logo_dimensions(
    width: float,
    height: float,
    required_ratio: float = 4.0,
    ratio_tolerance: float = 0.05,
    min_height_px: int = 24
) -> Dict[str, Any]:
    """
    Validate logo dimensions, aspect ratio preservation, and minimum display size.
    Prevents stretched, squashed, or illegibly small logo rendering.
    """
    if height <= 0:
        return {"valid": False, "reason": "Logo height must be greater than zero."}
    
    actual_ratio = round(width / height, 2)
    ratio_diff = abs(actual_ratio - required_ratio)
    is_distorted = ratio_diff > ratio_tolerance
    is_undersized = height < min_height_px

    return {
        "width": width,
        "height": height,
        "actual_ratio": actual_ratio,
        "required_ratio": required_ratio,
        "is_distorted": is_distorted,
        "is_undersized": is_undersized,
        "passes_spec": not is_distorted and not is_undersized,
        "clearspace_margin_px": round(height * 0.5, 1)  # standard 'A' height isolation zone
    }

def check_trademark_compliance(
    text: str,
    master_brand: str = "ApexDynamics",
    product_lines: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Verify whether registered trademarks (®) and product line trademarks (™)
    are properly designated upon initial occurrence in customer-facing collateral.
    """
    if product_lines is None:
        product_lines = ["Apex Core", "Apex Pulse", "Apex Studio"]

    findings = []
    
    # 1. Check master brand first-occurrence trademark designation
    master_matches = list(re.finditer(rf"\b{re.escape(master_brand)}\b", text))
    if master_matches:
        first_match = master_matches[0]
        # Check if immediately followed by ®
        subsequent = text[first_match.end():first_match.end()+2]
        if "®" not in subsequent:
            findings.append({
                "rule_code": "TM-01",
                "brand_name": master_brand,
                "span_start": first_match.start(),
                "span_end": first_match.end(),
                "explanation": f"First mention of '{master_brand}' requires registered trademark symbol: '{master_brand}®'.",
                "suggested_correction": f"{master_brand}®"
            })

    # 2. Check product line trademarks (™)
    for prod in product_lines:
        p_matches = list(re.finditer(rf"\b{re.escape(prod)}\b", text))
        if p_matches:
            first_match = p_matches[0]
            subsequent = text[first_match.end():first_match.end()+2]
            if "™" not in subsequent and "®" not in subsequent:
                findings.append({
                    "rule_code": "TM-02",
                    "brand_name": prod,
                    "span_start": first_match.start(),
                    "span_end": first_match.end(),
                    "explanation": f"First mention of product line '{prod}' requires trademark symbol: '{prod}™'.",
                    "suggested_correction": f"{prod}™"
                })

    return findings

