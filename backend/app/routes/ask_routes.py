from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import time

from app.services.embedding_service import generate_embeddings
from app.services.vector_service import (
    semantic_search,
    get_context_from_results,
)
from app.services.llm_service import generate_answer

router = APIRouter()


class QuestionRequest(BaseModel):
    question: str
    document_id: Optional[str] = None
    provider: Optional[str] = "ollama"


@router.post("/ask")
async def ask_ai(data: QuestionRequest):

    print("ASK ROUTE EXECUTED")

    total_start = time.time()

    # ==========================
    # Embedding
    # ==========================

    embedding_start = time.time()

    query_embedding = generate_embeddings(
        [data.question]
    )[0]

    print(
        f"Embedding Time: {time.time() - embedding_start:.2f} sec"
    )

    # ==========================
    # Semantic Search
    # ==========================

    search_start = time.time()

    if data.document_id:

        print(f"\nSearching ONLY document : {data.document_id}\n")

        results = semantic_search(
            query_embedding,
            top_k=5,
            where={
                "document_id": data.document_id
            }
        )

    else:

        print("\nSearching Entire Knowledge Base\n")

        results = semantic_search(
            query_embedding,
            top_k=5
        )

    print("\n========== SEARCH RESULTS ==========")
    print(results)
    print("====================================\n")

    context, metadata = get_context_from_results(results)
    if not context.strip():
      return {
        "question": data.question,
        "answer": "Information not found in the uploaded document."
    }

    print("\n========== METADATA ==========\n")
    print(metadata)

    print("\n========== RETRIEVED CONTEXT ==========\n")
    print(context)

    print(
        f"\nSearch Time: {time.time() - search_start:.2f} sec"
    )

    # ==========================
    # LLM
    # ==========================

    llm_start = time.time()
    print("\n================ PROMPT TEST ================\n")
    print("QUESTION:")
    print(data.question)

    print("\nCONTEXT:")
    print(context)

    print("\n=============================================\n")

    answer = generate_answer(
    context,
    data.question,
    data.provider
)

    print(
        f"LLM Time: {time.time() - llm_start:.2f} sec"
    )

    print(
        f"Total Time: {time.time() - total_start:.2f} sec"
    )

    return {
        "question": data.question,
        "answer": answer
    }