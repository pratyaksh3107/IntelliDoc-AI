from app.services.llm_service import generate_answer

context = """
RAG stands for Retrieval Augmented Generation.
It combines retrieval systems with large language models.
"""

question = "What is RAG?"

answer = generate_answer(context, question)

print(answer)