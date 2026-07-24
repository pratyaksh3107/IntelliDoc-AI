import chromadb
import uuid

client = chromadb.PersistentClient(path="vector_db")

collection = client.get_or_create_collection(
    name="intellidoc_documents"
)


def store_chunks(chunks, embeddings, metadata_list):
    """
    Store document chunks with embeddings and metadata.
    """

    ids = [str(uuid.uuid4()) for _ in chunks]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings.tolist(),
        metadatas=metadata_list
    )


def semantic_search(query_embedding, top_k=3, where=None):
    """
    Semantic search.
    If 'where' is provided, search only matching documents.
    """

    if where:
        results = collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=top_k,
            where=where
        )
    else:
        results = collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=top_k
        )

    return results


def get_context_from_results(results):
    """
    Returns:
    - context
    - metadata
    """

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]

    context = "\n\n".join(documents)

    return context, metadatas


def get_all_documents():

    results = collection.get(
        include=["metadatas"]
    )
    print("TOTAL METADATA:", len(results["metadatas"]))

    for m in results["metadatas"]:
       print(m)

    print("\n========== COLLECTION ==========")
    print(results)
    print("================================\n")

    documents = {}

    for metadata in results["metadatas"]:

        if metadata is None:
            continue

        if "document_id" not in metadata:
            continue

        doc_id = metadata["document_id"]

        if doc_id not in documents:

            documents[doc_id] = {
                "document_id": doc_id,
                "filename": metadata["filename"],
                "file_type": metadata["file_type"],
                "upload_date": metadata["upload_date"],
                "chunks": 1,
            }

        else:

            documents[doc_id]["chunks"] += 1

    return list(documents.values())


def delete_document(document_id):
    """
    Delete document from ChromaDB and return filename.
    """

    results = collection.get(
        where={
            "document_id": document_id
        },
        include=["metadatas"]
    )

    filename = None

    if results["metadatas"]:
        filename = results["metadatas"][0]["filename"]

    collection.delete(
        where={
            "document_id": document_id
        }
    )

    return filename


def clear_collection():

    global collection

    client.delete_collection("intellidoc_documents")

    collection = client.get_or_create_collection(
        name="intellidoc_documents"
    )


# ==========================================================
# Get ALL chunks of one document
# (Used ONLY for document summary)
# ==========================================================

def get_all_chunks(document_id):
    """
    Returns all chunks and metadata of one document.

    We will sort them later using chunk_number.
    """

    results = collection.get(
        where={
            "document_id": document_id
        },
        include=["documents", "metadatas"]
    )

    return results