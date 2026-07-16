from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def generate_embeddings(chunks):

    print("TYPE:", type(chunks))

    for i, chunk in enumerate(chunks):
        print(f"\nChunk {i}")
        print("Type:", type(chunk))
        print("Length:", len(chunk))
        print("Preview:", repr(chunk[:100]))

    embeddings = model.encode(
        chunks,
        convert_to_numpy=True,
        show_progress_bar=False
    )

    return embeddings