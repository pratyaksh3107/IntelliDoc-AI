import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize

try:
    nltk.download("punkt", quiet=True)
    nltk.download("stopwords", quiet=True)
    nltk.download("punkt_tab", quiet=True)
except Exception:
    pass


def is_quality_chunk(chunk_text: str) -> bool:
    """
    Strict OCR Garbage Filter: Rejects empty, low-alphabet ratio, broken words, or noisy OCR garbage.
    """
    if not chunk_text or len(chunk_text.strip()) < 30:
        return False

    clean_str = chunk_text.strip()
    alpha_chars = sum(1 for c in clean_str if c.isalpha())
    total_chars = len(clean_str)

    # Reject if alphabetic ratio is below 30% to allow financial tables / dates / calendars
    if (alpha_chars / max(1, total_chars)) < 0.30:
        return False

    # Reject if chunk consists mostly of repetitive noise symbols
    if re.search(r"([^\w\s])\1{4,}", clean_str):
        return False

    # Reject broken words (e.g., "T h i s i s b r o k e n")
    words = clean_str.split()
    if len(words) > 5:
        short_words = sum(1 for w in words if len(w) <= 2 and w.isalpha())
        if (short_words / len(words)) > 0.6:
            return False

    return True


def preprocess_text(text: str) -> str:
    """Normalizes text for embedding generation while preserving original for display."""
    text_lower = text.lower()
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", text_lower)
    words = cleaned.split()
    try:
        stop_words = set(stopwords.words("english"))
        words = [w for w in words if w not in stop_words]
    except Exception:
        pass
    return " ".join(words)


def create_chunks(text: str, max_chunk_size: int = 1500) -> list:
    """
    Structural & Semantic Chunking:
    Splits text by headings and natural paragraph boundaries.
    """
    if not text or not text.strip():
        return []

    # Try splitting by markdown headings if present
    if "#" in text:
        sections = re.split(r'\n(?=#+ )', text)
    else:
        sections = [text]

    raw_chunks = []
    
    for section in sections:
        # Split section into paragraphs
        paragraphs = [p.strip() for p in section.split("\n\n") if p.strip()]
        
        current_chunk = ""
        for para in paragraphs:
            # If a single paragraph is too large, we must split it by sentences
            if len(para) > max_chunk_size:
                if current_chunk:
                    raw_chunks.append(current_chunk.strip())
                    current_chunk = ""
                    
                try:
                    sentences = sent_tokenize(para)
                except Exception:
                    sentences = re.split(r'(?<=[.!?])\s+', para)
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) + 1 <= max_chunk_size:
                        current_chunk = (current_chunk + " " + sentence).strip()
                    else:
                        if current_chunk:
                            raw_chunks.append(current_chunk.strip())
                        current_chunk = sentence
            else:
                if len(current_chunk) + len(para) + 2 <= max_chunk_size:
                    current_chunk = (current_chunk + "\n\n" + para).strip()
                else:
                    if current_chunk:
                        raw_chunks.append(current_chunk.strip())
                    current_chunk = para
                    
        if current_chunk:
            raw_chunks.append(current_chunk.strip())

    # Apply Strict OCR Quality Filtering
    clean_quality_chunks = [c for c in raw_chunks if is_quality_chunk(c)]

    return clean_quality_chunks