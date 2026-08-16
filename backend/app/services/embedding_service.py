import numpy as np
import hashlib

def generate_embeddings(chunks):
    """
    Generates 384-dimensional normalized dense vectors using hashing and term-frequency statistics.
    Ultra-fast and zero memory overhead for 512MB RAM cloud instances.
    """
    if not chunks:
        return np.empty((0, 384), dtype=np.float32)

    embeddings = []
    for chunk in chunks:
        vec = np.zeros(384, dtype=np.float32)
        words = str(chunk).lower().split()
        for word in words:
            h = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16) % 384
            vec[h] += 1.0
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        embeddings.append(vec)
    return np.array(embeddings, dtype=np.float32)