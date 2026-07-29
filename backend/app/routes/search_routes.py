from fastapi import APIRouter
from typing import Optional
import time
from concurrent.futures import ThreadPoolExecutor

from app.services.embedding_service import generate_embeddings
from app.services.vector_service import semantic_search

router = APIRouter()
executor = ThreadPoolExecutor(max_workers=4)


@router.get("/semantic-search")
def semantic_search_api(query: str):
    start_time = time.time()
    query_embedding = generate_embeddings([query])[0]
    results = semantic_search(query_embedding, top_k=10)
    
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    dists = results.get("distances", [[]])[0]
    
    formatted = []
    for idx, text in enumerate(docs):
        meta = metas[idx] if idx < len(metas) and metas[idx] else {}
        dist = dists[idx] if idx < len(dists) else 1.0
        score = max(0, min(100, int((1.0 - (dist / 2.0)) * 100)))
        formatted.append({
            "filename": meta.get("filename", "Document"),
            "page": meta.get("page", 1),
            "similarity_score": score,
            "snippet": text
        })

    return {
        "query": query,
        "results": formatted,
        "retrieval_time": round(time.time() - start_time, 3)
    }


@router.get("/keyword-search")
def keyword_search_api(query: str):
    start_time = time.time()
    query_words = set(query.lower().split())
    
    # Retrieve candidates using broad query embedding
    query_embedding = generate_embeddings([query])[0]
    results = semantic_search(query_embedding, top_k=20)
    
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    
    keyword_matches = []
    for idx, text in enumerate(docs):
        text_words = set(text.lower().split())
        overlap = len(query_words & text_words)
        if overlap > 0:
            meta = metas[idx] if idx < len(metas) and metas[idx] else {}
            keyword_matches.append({
                "filename": meta.get("filename", "Document"),
                "page": meta.get("page", 1),
                "keyword_overlap": overlap,
                "snippet": text
            })
            
    keyword_matches.sort(key=lambda x: x["keyword_overlap"], reverse=True)

    return {
        "query": query,
        "results": keyword_matches,
        "retrieval_time": round(time.time() - start_time, 3)
    }


@router.get("/global-search")
def global_hybrid_search(query: str, search_type: str = "hybrid"):
    start_time = time.time()
    
    # Execute semantic search and keyword search in parallel
    future_sem = executor.submit(semantic_search_api, query)
    future_kw = executor.submit(keyword_search_api, query)
    
    sem_res = future_sem.result()
    kw_res = future_kw.result()
    
    return {
        "query": query,
        "search_type": search_type,
        "semantic_results": sem_res.get("results", []),
        "keyword_results": kw_res.get("results", []),
        "total_time_sec": round(time.time() - start_time, 3)
    }
