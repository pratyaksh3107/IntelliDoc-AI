import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-flash-latest"
)


def generate_answer(context, question):

    prompt = f"""
Answer in a detailed and student-friendly manner.
Use 4-8 sentences when enough information is available.


Context:
{context}

Question:
{question}

Answer:
"""

    response = model.generate_content(prompt)

    return response.text