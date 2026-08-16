from sentence_transformers import SentenceTransformer
import torch

torch.set_num_threads(1)

model = SentenceTransformer("all-MiniLM-L6-v2")

def generate_embeddings(chunks):
    if not chunks:
        return []

    with torch.no_grad():
        embeddings = model.encode(
            chunks,
            convert_to_numpy=True,
            show_progress_bar=False,
            batch_size=8
        )

    return embeddings