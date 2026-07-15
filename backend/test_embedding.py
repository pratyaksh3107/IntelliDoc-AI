from app.services.embedding_service import generate_embeddings

chunks = [
    "RAG combines retrieval and generation",
    "Machine learning is a subset of AI"
]

embeddings = generate_embeddings(chunks)

print("Number of embeddings:", len(embeddings))
print("Embedding size:", len(embeddings[0]))