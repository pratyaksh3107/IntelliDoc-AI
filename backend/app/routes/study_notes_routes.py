from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.vector_service import get_all_chunks
from app.services.llm_service import generate_study_notes

router = APIRouter()


class StudyNotesRequest(BaseModel):
    document_id: Optional[str] = None
    provider: Optional[str] = "ollama"


@router.post("/study-notes")
async def study_notes(data: StudyNotesRequest):

    if not data.document_id:
        return {"error": "Document ID is required."}

    results = get_all_chunks(data.document_id)

    documents = results.get("documents", [])
    metadatas = results.get("metadatas", [])

    if not documents:
        return {"error": "No document found."}

    chunk_data = list(zip(documents, metadatas))
    chunk_data.sort(key=lambda x: x[1]["chunk_number"])

    context = "\n\n".join(chunk for chunk, _ in chunk_data)

    notes = generate_study_notes(
    context,
    data.provider
)

    return {
        "study_notes": notes
    }