from pypdf import PdfReader
import io


def extract_pdf_text(pdf_bytes):

    pdf_reader = PdfReader(io.BytesIO(pdf_bytes))

    extracted_text = ""

    for page in pdf_reader.pages:

        text = page.extract_text()

        if text:
            extracted_text += text + "\n"

    extracted_text = extracted_text.encode(
        "utf-8",
        errors="ignore"
    ).decode("utf-8")

    return extracted_text, len(pdf_reader.pages)