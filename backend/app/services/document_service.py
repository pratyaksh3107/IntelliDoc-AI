import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

UPLOADS_FOLDER = os.path.join(BASE_DIR, "uploads")


def get_uploaded_documents():

    if not os.path.exists(UPLOADS_FOLDER):
        return []

    return os.listdir(UPLOADS_FOLDER)