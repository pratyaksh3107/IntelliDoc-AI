import google.generativeai as genai

genai.configure(api_key="AIzaSyAV829IPT3scKD1xbSvStXy-iIQ0NWTRu0")

model = genai.GenerativeModel("gemini-flash-latest")


def generate_answer(context, question):
    prompt = f"""
You are an AI document assistant.

Use ONLY the provided context to answer the user's question.

Context:
{context}

Question:
{question}

Answer:
"""

    response = model.generate_content(prompt)

    return response.text