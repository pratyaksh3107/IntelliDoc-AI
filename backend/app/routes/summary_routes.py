from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import time

from app.services.vector_service import get_all_chunks
from app.services.llm_service import generate_summary

router = APIRouter()


class SummaryRequest(BaseModel):
    document_id: Optional[str] = None
    provider: Optional[str] = "ollama"


@router.post("/summary")
async def generate_document_summary(data: SummaryRequest):

    total_start = time.time()

    if not data.document_id:
        return {
            "error": "Document ID is required."
        }

    print("\n========== SUMMARY ROUTE ==========\n")

    # --------------------------------------------------
    # Fetch ALL chunks of this document
    # --------------------------------------------------

    results = get_all_chunks(data.document_id)

    documents = results.get("documents", [])
    metadatas = results.get("metadatas", [])

    if len(documents) == 0:
        return {
            "error": "No document content found."
        }

    # --------------------------------------------------
    # Sort chunks in original document order
    # --------------------------------------------------

    chunk_data = list(zip(documents, metadatas))

    chunk_data.sort(
        key=lambda item: item[1]["chunk_number"]
    )

    # --------------------------------------------------
    # Hierarchical Summarization (Map → Reduce)
    # --------------------------------------------------

    context = "\n\n".join(
    chunk for chunk, metadata in chunk_data
)

    summary = generate_summary(
    context,
    data.provider
)

    print(
        f"Summary Generated in {time.time() - total_start:.2f} sec"
    )

    return {
        "summary": summary
    }