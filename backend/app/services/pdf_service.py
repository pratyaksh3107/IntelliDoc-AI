from pypdf import PdfReader
import io

import fitz
import pytesseract
from PIL import Image

# Windows Tesseract Path
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

    # Normal PDF text found
    if extracted_text.strip():

        extracted_text = extracted_text.encode(
            "utf-8",
            errors="ignore"
        ).decode("utf-8")

        return extracted_text, len(pdf_reader.pages)

    # ==========================
    # OCR Fallback
    # ==========================

    print("No selectable text found. Using OCR...")

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

    ocr_text = ocr_text.encode(
        "utf-8",
        errors="ignore"
    ).decode("utf-8")

    return ocr_text, len(doc)


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