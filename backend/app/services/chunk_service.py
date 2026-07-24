import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize

# First time only
nltk.download("punkt")
nltk.download("stopwords")

try:
    nltk.download("punkt_tab")
except:
    pass


def preprocess_text(text):
    """
    Used ONLY for embeddings/search.
    Teacher's preprocessing pipeline is preserved.
    """

    text = text.lower()

    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)

    tokens = word_tokenize(text)

    stop_words = set(stopwords.words("english"))

    filtered_tokens = [
        word for word in tokens
        if word not in stop_words
    ]

    cleaned_text = " ".join(filtered_tokens)

    return cleaned_text


def create_chunks(text, chunk_size=700):

    sentences = sent_tokenize(text)

    chunks = []
    current_chunk = ""

    for sentence in sentences:

        sentence = preprocess_text(sentence)

        if len(current_chunk) + len(sentence) <= chunk_size:

            current_chunk += " " + sentence

        else:

            if current_chunk.strip():
                chunks.append(current_chunk.strip())

            current_chunk = sentence

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks