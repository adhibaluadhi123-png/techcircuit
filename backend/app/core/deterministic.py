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
    
    for rule in rules:
        if rule.get("enforcement_type") != "DETERMINISTIC":
            continue
        if rule.get("category") not in ["Terminology", "Claims", "Formatting"]:
            continue
            
        pattern = rule.get("pattern")
        fail_example = rule.get("fail_example", "")
        
        # If no explicit regex pattern is provided, build one from fail_example or key phrases
        if not pattern and fail_example:
            # Escape regex special chars and match word boundaries
            clean_phrase = re.escape(fail_example.strip())
            pattern = rf"\b{clean_phrase}\b"
            
        if not pattern:
            continue
            
        try:
            regex = re.compile(pattern, re.IGNORECASE)
            for match in regex.finditer(text):
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
                    "suggested_correction": rule.get("pass_example") or None,
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
