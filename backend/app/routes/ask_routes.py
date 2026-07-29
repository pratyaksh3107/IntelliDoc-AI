from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import time
import logging
import re
from datetime import datetime

from app.services.embedding_service import generate_embeddings
from app.services.vector_service import semantic_search
from app.services.llm_service import generate_answer
from app.routes.global_ai_routes import expand_query, compress_context, compute_grounded_confidence

router = APIRouter()

class QuestionRequest(BaseModel):
    question: str
    document_id: Optional[str] = None
    provider: Optional[str] = "ollama"

@router.post("/ask")
async def ask_ai(data: QuestionRequest):
    try:
        if not data.question or not data.question.strip():
            return {
                "question": data.question,
                "answer": "Please provide a valid question."
            }

        start_time = time.time()
        
        expanded_query = expand_query(data.question)
        query_embedding = generate_embeddings([expanded_query])[0]

        # ── Retrieve candidates ──
        where_clause = {"document_id": data.document_id} if data.document_id else None
        results = semantic_search(query_embedding, top_k=20, where=where_clause)

        if not results or not results.get("documents") or not results["documents"][0]:
            return {
                "question": data.question,
                "answer": "Insufficient evidence found in this document to answer your question."
            }

        raw_docs = results["documents"][0]
        raw_metadatas = results.get("metadatas", [[]])[0]
        raw_distances = results.get("distances", [[]])[0]

        query_words = set(re.findall(r'\b\w+\b', data.question.lower()))

        candidates = []
        seen_texts = set()

        for idx, text in enumerate(raw_docs):
            # Duplicate chunk removal
            text_snippet = text.strip()[:100]
            if text_snippet in seen_texts:
                continue
            seen_texts.add(text_snippet)

            meta = raw_metadatas[idx] if idx < len(raw_metadatas) and raw_metadatas[idx] else {}
            dist = raw_distances[idx] if idx < len(raw_distances) else 1.0
            sem_score = max(0.0, min(1.0, 1.0 - (dist / 2.0)))

            text_words = set(re.findall(r'\b\w+\b', text.lower()))
            kw_overlap = len(query_words & text_words) / max(1, len(query_words))

            # Since it's document-specific, title bonus is less relevant, rely mostly on semantic and keyword
            hybrid_score = (sem_score * 0.6) + (kw_overlap * 0.4)

            candidates.append({
                "document_id": meta.get("document_id", "unknown"),
                "filename": meta.get("filename", "Document"),
                "page": meta.get("page", 1),
                "text": text,
                "sem_score": sem_score,
                "hybrid_score": hybrid_score
            })

        candidates.sort(key=lambda x: x["hybrid_score"], reverse=True)
        selected = candidates[:5]

        # ── Threshold check ──
        conf_pct, _, _ = compute_grounded_confidence(candidates, selected)
        if conf_pct < 35: # slightly lower threshold for specific doc Q&A
            return {
                "question": data.question,
                "answer": "Insufficient evidence found in the document to answer accurately."
            }

        context = compress_context(selected)

        answer = generate_answer(context, data.question, data.provider or "ollama")

        return {
            "question": data.question,
            "answer": answer
        }

    except Exception as e:
        logging.error(f"Ask AI Error: {e}")
        return {
            "question": data.question,
            "answer": f"⚠️ Engine Error: {str(e)}"
        }