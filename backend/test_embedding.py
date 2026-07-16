from app.services.embedding_service import generate_embeddings

chunks = [
    "Hello World",
    "Natural Language Processing"
]

embeddings = generate_embeddings(chunks)

print("Success")
print(embeddings.shape)