from fastapi import APIRouter
from app.services.document_service import get_uploaded_documents

router = APIRouter()


@router.get("/documents")
def get_documents():
    documents = get_uploaded_documents()

    return {
        "count": len(documents),
        "documents": documents
    }