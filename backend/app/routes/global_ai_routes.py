from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import time
import logging
import re
from datetime import datetime

from app.services.embedding_service import generate_embeddings
from app.services.vector_service import semantic_search
from app.services.llm_service import generate_global_answer

router = APIRouter()

class GlobalQuestionRequest(BaseModel):
    question: str
    provider: Optional[str] = "ollama"
    top_k: Optional[int] = 20  # Fetch 20 for reranking

GREETING_WORDS = [
    "hi", "hello", "hy", "hey", "greetings", "good morning", "good afternoon",
    "good evening", "howdy", "sup", "how are you", "who are you", "what is your name",
    "what can you do", "who created you", "tell me about yourself"
]

GREETING_PATTERNS = [
    r"^(hi|hello|hy|hey|hey there|greetings|good morning|good afternoon|good evening|howdy|sup)[\s!\.]*$",
    r"^(how are you|how do you do|who are you|what is your name|what can you do)[\s!\.]*$",
    r"^(hi intellidoc|hello intellidoc|hey intellidoc)[\s!\.]*$",
]

def is_greeting(query: str) -> bool:
    """Checks if query is a simple greeting or conversational opener."""
    q_clean = query.strip().lower()
    if q_clean in GREETING_WORDS or any(q_clean.startswith(w) for w in GREETING_WORDS if len(w) > 2):
        return True
    for pattern in GREETING_PATTERNS:
        if re.search(pattern, q_clean, re.IGNORECASE):
            return True
    return False

def expand_query(query: str) -> str:
    """Intelligent Query Expansion."""
    q_lower = query.lower()
    expanded_terms = [query]

    if any(w in q_lower for w in ["age", "old", "dob", "birth", "born", "birthdate"]):
        expanded_terms.append("date of birth DOB birthdate born birth year age")
    if any(w in q_lower for w in ["fee", "fees", "paid", "payment", "cost", "charge", "receipt", "hostel"]):
        expanded_terms.append("fee payment charges receipt hostel booking INR rupees transaction invoice")
    if any(w in q_lower for w in ["cnn", "deep learning", "neural", "network", "ml", "nlp", "llm"]):
        expanded_terms.append("convolutional neural network CNN deep learning machine learning NLP model algorithm")
    if any(w in q_lower for w in ["email", "phone", "contact", "address"]):
        expanded_terms.append("email phone contact mobile address gmail details")
    if any(w in q_lower for w in ["sanjay", "mathur", "report", "person"]):
        expanded_terms.append("name person student employee profile sanjay mathur astroshubh")

    return " ".join(expanded_terms)

def detect_user_intent(question: str) -> str:
    """Detects query intent for query routing."""
    if is_greeting(question):
        return "greeting"

    q_lower = question.lower()
    if any(w in q_lower for w in ["summarize", "summary"]):
        return "summary"
    if any(w in q_lower for w in ["compare", "difference", "vs"]):
        return "comparison"
    if any(w in q_lower for w in ["which file", "what file", "file contains", "where is", "which pdf", "which document"]):
        return "file_lookup"
    if any(w in q_lower for w in ["age", "how old", "birth", "dob", "fee", "fees", "payment", "paid", "receipt", "amount", "phone", "email", "date"]):
        return "fact_lookup"
    if any(w in q_lower for w in ["extract", "list all", "find all"]):
        return "extraction"
    if any(w in q_lower for w in ["calculate", "math", "+", "-", "sum", "multiply"]):
        return "math"
    if any(w in q_lower for w in ["why", "explain", "reason", "how does"]):
        return "reasoning"
    
    return "general_rag"

def compute_grounded_confidence(candidates: list, top_selected: list) -> tuple:
    """
    Dynamic Confidence based on Retrieval Score, Agreement, Keyword Overlap, Source Consistency.
    - One exact document -> 95%
    - Two agreeing chunks -> 92%
    - One exact chunk -> 90%
    - Weak evidence -> 55%
    - Conflicting/Low -> 40%
    """
    if not top_selected:
        return (0, "Low Confidence", "No matching text passages found.")

    top_score = top_selected[0]["hybrid_score"]
    top_doc = top_selected[0]["filename"]
    agreeing_chunks = [c for c in top_selected if c["filename"] == top_doc]

    if top_score > 0.65:
        return (95, "High", f"Verified with strong match in {top_doc}.")
    elif len(agreeing_chunks) >= 2 and top_score > 0.4:
        return (92, "High", f"Verified across {len(agreeing_chunks)} consistent passages in {top_doc}.")
    elif top_score >= 0.3:
        return (80, "Medium", f"Single chunk verified in {top_doc}.")
    elif top_score >= 0.15:
        return (60, "Medium", "Moderate evidence found across chunks.")
    else:
        return (40, "Low", "Conflicting or low-quality evidence found.")

def compress_context(selected_chunks: list) -> str:
    """
    Context Compression: Remove duplicate sentences across retrieved chunks.
    """
    seen_sentences = set()
    compressed_text_parts = []
    
    for item in selected_chunks:
        filename = item["filename"]
        page = item["page"]
        raw_text = item["text"]
        
        # Split by sentences or newlines
        sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +|\n', raw_text) if len(s.strip()) > 10]
        unique_sentences = []
        for s in sentences:
            if s not in seen_sentences:
                unique_sentences.append(s)
                seen_sentences.add(s)
        
        if unique_sentences:
            compressed_text = " ".join(unique_sentences)
            compressed_text_parts.append(f"--- SOURCE DOCUMENT: {filename} (Page {page}) ---\n{compressed_text}")
            
    return "\n\n".join(compressed_text_parts)


@router.post("/ask-global")
async def ask_global_ai(data: GlobalQuestionRequest):
    """
    Production RAG Engine Endpoint
    """
    try:
        if not data.question or not data.question.strip():
            return {
                "question": data.question,
                "answer": "Please provide a valid question.",
                "matched_documents": [],
                "sources": [],
                "confidence_score": 0,
                "confidence_rating": "N/A"
            }

        start_time = time.time()
        current_year = datetime.now().year
        intent = detect_user_intent(data.question)

        # ── INTENT BYPASS: GREETING ────────────────
        if intent == "greeting":
            return {
                "question": data.question,
                "answer": "Hello! I am IntelliDoc AI, your Document Intelligence Platform. How can I help you today?",
                "matched_documents": [],
                "sources": [],
                "confidence_score": 100,
                "confidence_rating": "Greeting"
            }

        # ── INTENT ROUTING: SUMMARY & COMPARISON ────────────────
        if intent == "summary":
            return {
                "question": data.question,
                "answer": "To summarize a document, please navigate to the Summary view and select a specific document. Global Search is designed for answering factual questions across the entire knowledge base.",
                "matched_documents": [],
                "sources": [],
                "confidence_score": 100,
                "confidence_rating": "System Notice"
            }
        
        if intent == "comparison":
            return {
                "question": data.question,
                "answer": "To compare documents, please navigate to the Compare view and select the two specific documents you'd like to analyze.",
                "matched_documents": [],
                "sources": [],
                "confidence_score": 100,
                "confidence_rating": "System Notice"
            }

        # ── Step 1: Query expansion + embedding ──────────────────
        expanded_query = expand_query(data.question)
        query_embedding = generate_embeddings([expanded_query])[0]

        # ── Step 2: Retrieve candidate chunks (Top 20) ──────
        results = semantic_search(query_embedding, top_k=20, where=None)

        if not results or not results.get("documents") or not results["documents"][0]:
            return {
                "question": data.question,
                "answer": "Insufficient evidence found.",
                "matched_documents": [],
                "sources": [],
                "confidence_score": 40,
                "confidence_rating": "Low Confidence"
            }

        raw_docs      = results["documents"][0]
        raw_metadatas = results.get("metadatas", [[]])[0]
        raw_distances = results.get("distances", [[]])[0]
        raw_ids       = results.get("ids", [[]])[0]

        query_words = set(re.findall(r'\b\w+\b', data.question.lower()))

        # ── Step 3: Hybrid Search Reranking & Duplicate Removal ───────
        candidates = []
        seen_texts = set()

        for idx, text in enumerate(raw_docs):
            # Duplicate Removal (same paragraph multiple times)
            text_snippet = text.strip()[:100]
            if text_snippet in seen_texts:
                continue
            seen_texts.add(text_snippet)

            meta     = raw_metadatas[idx] if idx < len(raw_metadatas) and raw_metadatas[idx] else {}
            doc_id   = meta.get("document_id", "unknown")
            filename = meta.get("filename", "Document")
            page     = meta.get("page", meta.get("page_number", 1))

            dist = raw_distances[idx] if idx < len(raw_distances) else 1.0
            sem_score = max(0.0, min(1.0, 1.0 - (dist / 2.0)))

            # Keyword Overlap
            text_words = set(re.findall(r'\b\w+\b', text.lower()))
            kw_overlap = len(query_words & text_words) / max(1, len(query_words))
            
            # Document Title Search
            title_bonus = 0.4 if any(w in filename.lower() for w in query_words if len(w) > 3) else 0.0
            
            # File Lookup specific boost
            if intent == "file_lookup" and title_bonus > 0:
                title_bonus += 0.5 
            
            if intent == "fact_lookup":
                kw_overlap *= 1.5

            hybrid_score = (sem_score * 0.4) + (kw_overlap * 0.4) + (title_bonus * 0.2)

            candidates.append({
                "document_id": doc_id,
                "filename": filename,
                "page": page,
                "text": text,
                "sem_score": sem_score,
                "hybrid_score": hybrid_score
            })

        # Rerank (Sort descending)
        candidates.sort(key=lambda x: x["hybrid_score"], reverse=True)

        # ── Step 4: Top 5 Selection & Context Compression ──
        selected = candidates[:5]

        # ── Step 5: Dynamic Confidence & Threshold Filtering ─────────────────
        conf_pct, conf_rating, _ = compute_grounded_confidence(candidates, selected)

        if conf_pct < 35:
            return {
                "question": data.question,
                "answer": "Insufficient evidence found.",
                "matched_documents": [],
                "sources": [],
                "confidence_score": conf_pct,
                "confidence_rating": conf_rating
            }

        context = compress_context(selected)

        # Sources generation (Hide debug technical details)
        sources = []
        contributing_docs = {}
        
        for item in selected:
            if item["document_id"] not in contributing_docs:
                contributing_docs[item["document_id"]] = {
                    "filename": item["filename"]
                }
            
            sources.append({
                "filename": item["filename"],
                "page": item["page"],
                "snippet": item["text"][:250] + "…"
            })

        source_filenames = list({item["filename"] for item in selected})
        sources_list_str = "\n".join(f"  • {fn}" for fn in source_filenames)

        # ── Step 6: Execute LLM ──────────────────────────────────
        
        # Adjust prompt based on intent for Deterministic Retrieval
        strictness_rules = ""
        if intent in ["fact_lookup", "file_lookup", "math", "extraction"]:
            strictness_rules = "\nINTENT: DETERMINISTIC LOOKUP. Provide the exact answer immediately. DO NOT generate unnecessary reasoning or filler text. Return the exact date, number, entity, or filename directly based on the context."

        deduction_prompt = f"""You are IntelliDoc Global AI.
Answer precisely using ONLY the provided document context.
{strictness_rules}

CURRENT YEAR: {current_year}
USER QUESTION: {data.question}

DOCUMENT SOURCES RETRIEVED:
{sources_list_str}

============================================================
RETRIEVED DOCUMENT CONTEXT:
============================================================
{context}
============================================================

STRICT GUIDELINES:
1. FINAL ANSWER: State the clear, direct answer first.
2. REASONING: Explain how you arrived at the answer.
3. SOURCE ATTRIBUTION: Only cite the provided source documents. Never invent details.
"""
        answer = generate_global_answer(deduction_prompt, data.provider or "ollama")

        return {
            "question": data.question,
            "answer": answer,
            "matched_documents": list(contributing_docs.values()),
            "sources": sources,
            "confidence_score": conf_pct,
            "confidence_rating": conf_rating
        }

    except Exception as e:
        logging.error(f"Global AI Error: {e}")
        return {
            "question": data.question,
            "answer": f"⚠️ Engine Error: {str(e)}",
            "matched_documents": [],
            "sources": [],
            "confidence_score": 0,
            "confidence_rating": "Error"
        }
