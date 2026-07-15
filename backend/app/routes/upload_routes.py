from fastapi import APIRouter, UploadFile, File
from app.services.pdf_service import extract_pdf_text
from app.services.chunk_service import create_chunks
from app.services.embedding_service import generate_embeddings
from app.services.vector_service import store_chunks
import os

router = APIRouter()

stored_chunks = []


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    pdf_bytes = await file.read()

    file_path = os.path.join("uploads", file.filename)

    with open(file_path, "wb") as pdf_file:
        pdf_file.write(pdf_bytes)

    extracted_text, total_pages = extract_pdf_text(pdf_bytes)

    chunks = create_chunks(extracted_text)

    embeddings = generate_embeddings(chunks)

    store_chunks(chunks, embeddings)

    global stored_chunks
    stored_chunks = chunks

    return {
        "filename": file.filename,
        "pages": total_pages,
        "chunks": len(chunks),
        "preview": extracted_text[:500]
    }