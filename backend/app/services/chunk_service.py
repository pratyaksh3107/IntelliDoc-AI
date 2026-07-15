def create_chunks(text, chunk_size=500):
    chunks = []

    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])

    return chunks


def search_chunks(query, chunks):
    matching_chunks = []

    for chunk in chunks:
        if query.lower() in chunk.lower():
            matching_chunks.append(chunk)

    return matching_chunks