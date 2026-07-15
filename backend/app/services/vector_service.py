import chromadb
import uuid

client = chromadb.PersistentClient(path="vector_db")

collection = client.get_or_create_collection(
    name="intellidoc_documents"
)


def store_chunks(chunks, embeddings):
    ids = [str(uuid.uuid4()) for _ in chunks]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings.tolist()
    )


def search_chunks(query_embedding, top_k=5):
    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=top_k
    )

    return results


def semantic_search(query_embedding, top_k=3):
    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=top_k
    )

    return results


def get_context_from_results(results):
    documents = results["documents"][0]

    context = "\n\n".join(documents)

    return context