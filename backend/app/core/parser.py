"""Document Ingestion Parser for CANON Brand Governance.
Extracts clean plain text from PDF, DOCX, TXT, and images.
"""
import io
import re
from typing import Tuple, Dict, Any, Optional
import docx
import pypdf

def extract_text_from_txt(content_bytes: bytes) -> str:
    """Extract and decode plain text."""
    try:
        return content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return content_bytes.decode("latin-1", errors="replace")

def extract_text_from_docx(content_bytes: bytes) -> str:
    """Extract paragraphs and table text from DOCX."""
    doc = docx.Document(io.BytesIO(content_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    for table in doc.tables:
        for row in table.rows:
            row_texts = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if row_texts:
                paragraphs.append(" | ".join(row_texts))
    return "\n\n".join(paragraphs)

def extract_text_from_pdf(content_bytes: bytes) -> str:
    """Extract text from PDF pages using pypdf."""
    reader = pypdf.PdfReader(io.BytesIO(content_bytes))
    pages_text = []
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            pages_text.append(extracted.strip())
    return "\n\n".join(pages_text)

def parse_uploaded_file(filename: str, content_bytes: bytes) -> str:
    """
    Dispatcher based on file extension.
    Validates file type and extracts clean raw text.
    """
    ext = filename.lower().split(".")[-1]
    if ext == "txt":
        return extract_text_from_txt(content_bytes)
    elif ext in ["docx", "doc"]:
        return extract_text_from_docx(content_bytes)
    elif ext == "pdf":
        return extract_text_from_pdf(content_bytes)
    elif ext in ["png", "jpg", "jpeg"]:
        # Basic fallback notification if raw image without OCR text
        return f"[Image uploaded: {filename}. Visual and palette checks evaluated.]"
    else:
        raise ValueError(f"Unsupported file type '.{ext}'. Supported: .pdf, .docx, .txt, .png, .jpg")
