from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.vector_service import get_all_chunks
from app.services.llm_service import generate_document_comparison

router = APIRouter(
    prefix="/compare",
    tags=["Document Compare"]
)


class CompareRequest(BaseModel):
    document_id_1: str
    document_id_2: str
    provider: Optional[str] = "ollama"


@router.post("/")
async def compare_documents(data: CompareRequest):

    if not data.document_id_1 or not data.document_id_2:
        raise HTTPException(
            status_code=400,
            detail="Please select two documents."
        )

    # -----------------------------
    # Document 1
    # -----------------------------

    results1 = get_all_chunks(data.document_id_1)

    docs1 = results1.get("documents", [])
    meta1 = results1.get("metadatas", [])

    if len(docs1) == 0:
        raise HTTPException(
            status_code=404,
            detail="First document not found."
        )

    chunk_data1 = list(zip(docs1, meta1))
    chunk_data1.sort(
        key=lambda item: item[1]["chunk_number"]
    )

    context1 = "\n\n".join(
        chunk for chunk, metadata in chunk_data1
    )

    # -----------------------------
    # Document 2
    # -----------------------------

    results2 = get_all_chunks(data.document_id_2)

    docs2 = results2.get("documents", [])
    meta2 = results2.get("metadatas", [])

    if len(docs2) == 0:
        raise HTTPException(
            status_code=404,
            detail="Second document not found."
        )

    chunk_data2 = list(zip(docs2, meta2))
    chunk_data2.sort(
        key=lambda item: item[1]["chunk_number"]
    )

    context2 = "\n\n".join(
        chunk for chunk, metadata in chunk_data2
    )

    comparison = generate_document_comparison(
        context1,
        context2,
        data.provider
    )

    return {
        "comparison": comparison
    }