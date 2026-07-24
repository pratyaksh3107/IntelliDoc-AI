from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.vector_service import get_all_chunks
from app.services.llm_service import generate_faq

router = APIRouter()


class FAQRequest(BaseModel):
    document_id: Optional[str] = None
    provider: Optional[str] = "ollama"


@router.post("/faq")
async def generate_faq_route(request: FAQRequest):

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

    faq = generate_faq(
        context=context,
        provider=request.provider
    )

    return {
        "faq": faq
    }