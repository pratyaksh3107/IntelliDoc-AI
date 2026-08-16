from pypdf import PdfReader
import io
import os
import sys

import fitz
import pytesseract
from PIL import Image

# Set Windows Tesseract Path only if on Windows and file exists
if sys.platform == "win32" and os.path.exists(r"C:\Program Files\Tesseract-OCR\tesseract.exe"):
    pytesseract.pytesseract.tesseract_cmd = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )


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
    # Full Page OCR (for embedded images/tables)
    # ==========================
    print("Running OCR to capture embedded images/tables...")
    ocr_text = ""
    total_pages = len(pdf_reader.pages) or 1

    try:
        doc = fitz.open(
            stream=pdf_bytes,
            filetype="pdf"
        )
        total_pages = len(doc)

        for page in doc:
            pix = page.get_pixmap(dpi=300)
            img = Image.frombytes(
                "RGB",
                [pix.width, pix.height],
                pix.samples
            )
            text = pytesseract.image_to_string(img)
            ocr_text += text + "\n"

        ocr_text = ocr_text.encode(
            "utf-8",
            errors="ignore"
        ).decode("utf-8")
    except Exception as err:
        print("OCR processing warning:", err)

    final_text = extracted_text + "\n\n" + ocr_text
    return final_text, total_pages


def extract_image_text(image_bytes):
    """
    Extract text directly from PNG/JPG/JPEG images using OCR.
    """
    image = Image.open(io.BytesIO(image_bytes))
    text = ""
    try:
        text = pytesseract.image_to_string(image)
        text = text.encode(
            "utf-8",
            errors="ignore"
        ).decode("utf-8")
    except Exception as err:
        print("Image OCR error:", err)

    return text, 1