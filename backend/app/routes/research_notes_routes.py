from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.vector_service import get_all_chunks
from app.services.llm_service import generate_research_notes

router = APIRouter()


class ResearchNotesRequest(BaseModel):
    document_id: Optional[str] = None
    provider: Optional[str] = "ollama"


@router.post("/research-notes")
async def generate_research_notes_route(request: ResearchNotesRequest):

    if not request.document_id:
        return {
            "error": "Document ID is required."
        }

    results = get_all_chunks(request.document_id)

    documents = results["documents"]
    metadatas = results["metadatas"]

    combined = sorted(
        zip(documents, metadatas),
        key=lambda x: x[1]["chunk_number"]
    )

    context = "\n\n".join(
        doc for doc, _ in combined
    )

    notes = generate_research_notes(
        context=context,
        provider=request.provider
    )

    return {
        "research_notes": notes
    }