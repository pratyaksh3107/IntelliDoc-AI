from app.services.embedding_service import generate_embeddings
from app.services.vector_service import (
    store_chunks,
    search_chunks,
)

chunks = [
    "RAG combines retrieval and generation",
    "Machine learning is a subset of AI",
]

embeddings = generate_embeddings(chunks)

store_chunks(chunks, embeddings)

query = "What is RAG?"

query_embedding = generate_embeddings([query])[0]

results = search_chunks(query_embedding)

print(results)