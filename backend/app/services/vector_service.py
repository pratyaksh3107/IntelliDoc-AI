import chromadb
import uuid
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # backend/app
BACKEND_DIR = os.path.dirname(BASE_DIR) # backend
DB_PATH = os.path.join(BACKEND_DIR, "vector_db")

_client = None
_collection = None

def get_collection():
    global _client, _collection
    if _collection is None:
        try:
            os.makedirs(DB_PATH, exist_ok=True)
            _client = chromadb.PersistentClient(path=DB_PATH)
            _collection = _client.get_or_create_collection(name="intellidoc_documents")
            print("Initialized Persistent ChromaDB collection.")
        except Exception as e:
            print("Warning: Could not load Persistent ChromaDB, using EphemeralClient fallback:", e)
            try:
                _client = chromadb.EphemeralClient()
                _collection = _client.get_or_create_collection(name="intellidoc_documents")
            except Exception as e2:
                print("Error initializing EphemeralClient:", e2)
                _collection = None
    return _collection


def store_chunks(chunks, embeddings, metadata_list):
    """
    Store document chunks with embeddings and metadata.
    """
    col = get_collection()
    if not col or not chunks:
        return

    ids = [str(uuid.uuid4()) for _ in chunks]

    embeddings_list = embeddings.tolist() if hasattr(embeddings, "tolist") else list(embeddings)

    col.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings_list,
        metadatas=metadata_list
    )


def semantic_search(query_embedding, top_k=3, where=None):
    """
    Semantic search.
    If 'where' is provided, search only matching documents.
    """
    col = get_collection()
    if not col:
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

    query_emb_list = query_embedding.tolist() if hasattr(query_embedding, "tolist") else list(query_embedding)

    if where:
        results = col.query(
            query_embeddings=[query_emb_list],
            n_results=top_k,
            where=where
        )
    else:
        results = col.query(
            query_embeddings=[query_emb_list],
            n_results=top_k
        )

    return results


def get_context_from_results(results):
    """
    Returns:
    - context
    - metadata
    """
    if not results or not results.get("documents") or not results["documents"][0]:
        return "", []

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]

    context = "\n\n".join(documents)

    return context, metadatas


def get_all_documents():
    col = get_collection()
    if not col:
        return []

    try:
        results = col.get(include=["metadatas"])
    except Exception as e:
        print("Error getting documents from ChromaDB:", e)
        return []

    documents = {}

    if not results or "metadatas" not in results or not results["metadatas"]:
        return []

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
    col = get_collection()
    if not col:
        return None

    filename = None
    try:
        results = col.get(
            where={"document_id": document_id},
            include=["metadatas"]
        )

        if results and results.get("metadatas"):
            filename = results["metadatas"][0]["filename"]

        col.delete(where={"document_id": document_id})
    except Exception as e:
        print("Error deleting document from ChromaDB:", e)

    return filename


def clear_collection():
    global _client, _collection
    col = get_collection()
    if _client and col:
        try:
            _client.delete_collection("intellidoc_documents")
            _collection = _client.get_or_create_collection(name="intellidoc_documents")
        except Exception as e:
            print("Error clearing ChromaDB collection:", e)


# ==========================================================
# Get ALL chunks of one document
# (Used ONLY for document summary)
# ==========================================================

def get_all_chunks(document_id):
    """
    Returns all chunks and metadata of one document.

    We will sort them later using chunk_number.
    """
    col = get_collection()
    if not col:
        return {"documents": [], "metadatas": []}

    try:
        results = col.get(
            where={"document_id": document_id},
            include=["documents", "metadatas"]
        )
        return results
    except Exception as e:
        print("Error getting chunks from ChromaDB:", e)
        return {"documents": [], "metadatas": []}