from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.vector_service import get_all_chunks
from app.services.llm_service import generate_meeting_notes

router = APIRouter()


class MeetingNotesRequest(BaseModel):
    document_id: Optional[str] = None
    provider: Optional[str] = "ollama"


@router.post("/meeting-notes")
async def generate_meeting_notes_route(request: MeetingNotesRequest):

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

    notes = generate_meeting_notes(
        context=context,
        provider=request.provider
    )

    return {
        "meeting_notes": notes
    }