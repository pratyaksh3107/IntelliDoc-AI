from fastapi import APIRouter
from pydantic import BaseModel
import time

from app.services.embedding_service import generate_embeddings
from app.services.vector_service import (
    semantic_search,
    get_context_from_results
)
from app.services.llm_service import generate_answer

router = APIRouter()


class QuestionRequest(BaseModel):
    question: str


@router.post("/ask")
async def ask_ai(data: QuestionRequest):
    print("ASK ROUTE EXECUTED")
    total_start = time.time()

    # Embedding Time
    embedding_start = time.time()

    query_embedding = generate_embeddings(
        [data.question]
    )[0]

    print(
        f"Embedding Time: {time.time() - embedding_start:.2f} sec"
    )

    # Semantic Search Time
    search_start = time.time()

    results = semantic_search(
        query_embedding,
        top_k=3
    )

    context = get_context_from_results(results)

    print(
        f"Search Time: {time.time() - search_start:.2f} sec"
    )

    # Gemini Time
    gemini_start = time.time()

    answer = generate_answer(
        context,
        data.question
    )

    print(
        f"Gemini Time: {time.time() - gemini_start:.2f} sec"
    )

    print(
        f"Total Time: {time.time() - total_start:.2f} sec"
    )

    return {
        "question": data.question,
        "answer": answer
    }