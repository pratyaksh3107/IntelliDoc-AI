from fastapi import APIRouter
import time

from app.services.embedding_service import generate_embeddings
from app.services.vector_service import (
    semantic_search,
    get_context_from_results
)
from app.services.llm_service import generate_answer

router = APIRouter()


@router.get("/semantic-search")
def semantic_search_api(query: str):

    query_embedding = generate_embeddings([query])[0]

    results = semantic_search(query_embedding)

    return {
        "query": query,
        "results": results["documents"][0]
    }
