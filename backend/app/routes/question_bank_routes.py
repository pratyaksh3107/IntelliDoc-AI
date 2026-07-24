from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.vector_service import get_all_chunks
from app.services.llm_service import generate_question_bank

router = APIRouter()


class QuestionBankRequest(BaseModel):
    document_id: Optional[str] = None
    provider: Optional[str] = "ollama"


@router.post("/question-bank")
async def generate_question_bank_route(request: QuestionBankRequest):

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

    question_bank = generate_question_bank(
        context=context,
        provider=request.provider
    )

    return {
        "question_bank": question_bank
    }