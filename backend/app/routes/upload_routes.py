from fastapi import APIRouter, UploadFile, File
from typing import List
import os
import uuid
from datetime import datetime
from fastapi import HTTPException
from fastapi.responses import FileResponse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.dirname(BASE_DIR)
UPLOADS_DIR = os.path.join(BACKEND_DIR, "uploads")

from app.services.pdf_service import (
    extract_pdf_text,
    extract_image_text,
)

from app.services.chunk_service import create_chunks
from app.services.embedding_service import generate_embeddings

from app.services.vector_service import (
    store_chunks,
    get_all_documents,
    delete_document,
)

router = APIRouter()

stored_chunks = []


@router.post("/upload")
async def upload_file(files: List[UploadFile] = File(...)):

    results = []

    for file in files:

        file_bytes = await file.read()

        os.makedirs(UPLOADS_DIR, exist_ok=True)

        file_path = os.path.join(
            UPLOADS_DIR,
            file.filename
        )

        with open(file_path, "wb") as uploaded_file:
            uploaded_file.write(file_bytes)

        filename = file.filename.lower()

        # ==========================
        # PDF
        # ==========================

        if filename.endswith(".pdf"):

            extracted_text, total_pages = extract_pdf_text(
                file_bytes
            )

            file_type = "pdf"

        # ==========================
        # Images
        # ==========================

        elif (
            filename.endswith(".png")
            or filename.endswith(".jpg")
            or filename.endswith(".jpeg")
        ):

            extracted_text, total_pages = extract_image_text(
                file_bytes
            )

            file_type = "image"

        else:

            continue

        # ==========================
        # Chunking
        # ==========================

        print("Extracted Text Length:", len(extracted_text))

        chunks = create_chunks(extracted_text)

        clean_chunks = []

        for chunk in chunks:

            chunk = str(chunk)
            chunk = chunk.replace("\x00", "")
            chunk = chunk.replace("\ufffd", "")
            chunk = chunk.strip()

            if chunk:
                clean_chunks.append(chunk)

        print("Raw Chunks:", len(chunks))
        print("Clean Chunks:", len(clean_chunks))

        # ==========================
        # Embeddings
        # ==========================

        embeddings = generate_embeddings(clean_chunks)

        # ==========================
        # Remove Existing Document
        # ==========================

        existing_documents = get_all_documents()

        for doc in existing_documents:

            if doc["filename"] == file.filename:

                delete_document(doc["document_id"])

                break

        # ==========================
        # Metadata
        # ==========================

        document_id = str(uuid.uuid4())

        upload_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        metadata_list = []

        for index in range(len(clean_chunks)):

            metadata_list.append(
                {
                    "document_id": document_id,
                    "filename": file.filename,
                    "file_type": file_type,
                    "chunk_number": index + 1,
                    "upload_date": upload_date,
                }
            )

        # ==========================
        # Store
        # ==========================

        store_chunks(
            clean_chunks,
            embeddings,
            metadata_list
        )

        global stored_chunks
        stored_chunks = clean_chunks

        results.append(
            {
                "filename": file.filename,
                "document_id": document_id,
                "pages": total_pages,
                "chunks": len(clean_chunks),
                "preview": extracted_text[:500],
            }
        )

    return {
        "documents": results
    }


@router.delete("/document/{document_id}")
async def delete_uploaded_document(document_id: str):

    filename = delete_document(document_id)

    if not filename:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    file_path = os.path.join(UPLOADS_DIR, filename)

    if os.path.exists(file_path):
        os.remove(file_path)

    return {
        "message": "Document deleted successfully"
    }

@router.get("/download/{document_id}")
async def download_document(document_id: str):

    documents = get_all_documents()

    target = None

    for doc in documents:
        if doc["document_id"] == document_id:
            target = doc
            break

    if not target:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    file_path = os.path.join(
        UPLOADS_DIR,
        target["filename"]
    )

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return FileResponse(
        path=file_path,
        filename=target["filename"],
        media_type="application/octet-stream"
    )
