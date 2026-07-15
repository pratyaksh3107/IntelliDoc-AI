import os


def get_uploaded_documents():
    uploads_folder = "uploads"

    if not os.path.exists(uploads_folder):
        return []

    return os.listdir(uploads_folder)