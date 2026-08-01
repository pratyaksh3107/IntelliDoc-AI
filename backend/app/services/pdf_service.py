from pypdf import PdfReader
import io
import os

import fitz
import pytesseract
from PIL import Image

# Configure Tesseract only on Windows
if os.name == "nt":
    tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(tesseract_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_path


def extract_pdf_text(pdf_bytes):
    """
    Extract text from a PDF.
    If no selectable text exists, OCR is used automatically.
    """

    pdf_reader = PdfReader(io.BytesIO(pdf_bytes))

    extracted_text = ""

    for page in pdf_reader.pages:
        text = page.extract_text()

        if text and text.strip():
            extracted_text += text + "\n"

    # ==========================
    # OCR for embedded images / scanned PDFs
    # ==========================

    print("Running OCR to capture embedded images/tables...")

    doc = fitz.open(
        stream=pdf_bytes,
        filetype="pdf"
    )

    ocr_text = ""

    for page in doc:

        pix = page.get_pixmap(dpi=300)

        img = Image.frombytes(
            "RGB",
            [pix.width, pix.height],
            pix.samples
        )

        text = pytesseract.image_to_string(img)

        ocr_text += text + "\n"

    doc.close()

    ocr_text = ocr_text.encode(
        "utf-8",
        errors="ignore"
    ).decode("utf-8")

    final_text = extracted_text + "\n\n" + ocr_text

    return final_text, len(pdf_reader.pages)


def extract_image_text(image_bytes):
    """
    Extract text directly from PNG/JPG/JPEG images using OCR.
    """

    image = Image.open(io.BytesIO(image_bytes))

    text = pytesseract.image_to_string(image)

    text = text.encode(
        "utf-8",
        errors="ignore"
    ).decode("utf-8")

    return text, 1