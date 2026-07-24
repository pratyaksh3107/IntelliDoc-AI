from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.vector_service import get_all_chunks
from app.services.llm_service import generate_flashcards

router = APIRouter()


class FlashcardRequest(BaseModel):
    document_id: Optional[str] = None
    provider: Optional[str] = "ollama"


@router.post("/flashcards")
async def generate_flashcards_route(request: FlashcardRequest):

    if not request.document_id:
        return {
            "error": "Document ID is required."
        }

    results = get_all_chunks(request.document_id)

    documents = results["documents"]

    metadatas = results["metadatas"]

    # Keep original document order
    combined = sorted(
        zip(documents, metadatas),
        key=lambda x: x[1]["chunk_number"]
    )

    context = "\n\n".join(
        doc for doc, _ in combined
    )

    flashcards = generate_flashcards(
        context=context,
        provider=request.provider
    )

    return {
        "flashcards": flashcards
    }