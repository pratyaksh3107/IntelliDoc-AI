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


@router.get("/ask")
def ask_question(question: str):

    print("\n==============================")
    print("ASK ROUTE EXECUTED")
    print("==============================")

    total_start = time.time()

    # Embedding Time
    embedding_start = time.time()

    query_embedding = generate_embeddings(
        [question]
    )[0]

    embedding_time = time.time() - embedding_start

    print(
        f"Embedding Time: {embedding_time:.2f} sec"
    )

    # Semantic Search Time
    search_start = time.time()

    results = semantic_search(
        query_embedding
    )

    context = get_context_from_results(
        results
    )

    search_time = time.time() - search_start

    print(
        f"Search Time: {search_time:.2f} sec"
    )

    # Gemini Time
    gemini_start = time.time()

    answer = generate_answer(
        context,
        question
    )

    gemini_time = time.time() - gemini_start

    print(
        f"Gemini Time: {gemini_time:.2f} sec"
    )

    total_time = time.time() - total_start

    print(
        f"Total Time: {total_time:.2f} sec"
    )

    print("==============================\n")

    return {
        "question": question,
        "answer": answer
    }