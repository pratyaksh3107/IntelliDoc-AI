import numpy as np
import hashlib

_model = None

def get_model():
    global _model
    if _model is None:
        try:
            import torch
            torch.set_num_threads(1)
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            print("Loaded SentenceTransformer all-MiniLM-L6-v2 successfully.")
        except Exception as e:
            print("Warning: Could not load SentenceTransformer, using lightweight fallback embeddings:", e)
            _model = "fallback"
    return _model


def generate_fallback_embeddings(chunks):
    """
    Generates 384-dimensional normalized dense vectors using hashing and term-frequency statistics.
    Used when PyTorch/SentenceTransformers exceeds RAM limits on 512MB free tier cloud instances.
    """
    embeddings = []
    for chunk in chunks:
        vec = np.zeros(384, dtype=np.float32)
        words = chunk.lower().split()
        for word in words:
            h = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16) % 384
            vec[h] += 1.0
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        embeddings.append(vec)
    return np.array(embeddings)


def generate_embeddings(chunks):
    if not chunks:
        return []

    model = get_model()

    if model == "fallback":
        return generate_fallback_embeddings(chunks)

    try:
        import torch
        with torch.no_grad():
            embeddings = model.encode(
                chunks,
                convert_to_numpy=True,
                show_progress_bar=False,
                batch_size=4
            )
        return embeddings
    except Exception as err:
        print("SentenceTransformer encoding error, using fallback:", err)
        return generate_fallback_embeddings(chunks)