import os
import ollama
import traceback
import google.generativeai as genai

from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_response(prompt, provider):

    provider = (provider or "ollama").lower()

    if provider == "gemini":
        return call_gemini(prompt)

    return call_llm(prompt)


# ============================================================
# Internal Ollama Call
# ============================================================

def call_llm(prompt):

    try:

        response = ollama.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response["message"]["content"]

    except Exception as e:

        print("\n========== OLLAMA ERROR ==========\n")
        print(type(e))
        print(e)
        traceback.print_exc()
        print("\n==================================\n")

        raise

# ============================================================
# Gemini Call
# ============================================================

def call_gemini(prompt):

    try:

        model = genai.GenerativeModel("gemini-2.5-flash")

        response = model.generate_content(prompt)

        return response.text

    except Exception as e:

        print("\n========== GEMINI ERROR ==========\n")
        print(type(e))
        print(e)
        traceback.print_exc()
        print("\n==================================\n")
        raise

# ============================================================
# AI CHAT
# ============================================================

def generate_answer(
    context,
    question,
    provider
):

    prompt = f"""
You are IntelliDoc AI.

You are an expert AI tutor.

The user has uploaded a document.

You MUST answer ONLY using the provided document context.

-------------------------------------------------------

DOCUMENT CONTEXT

{context}

-------------------------------------------------------

USER QUESTION

{question}

-------------------------------------------------------

INSTRUCTIONS

1. Answer ONLY from the document.

2. Never use outside knowledge.

3. Never copy large portions of the document.

4. Rewrite the answer naturally.

5. Correct obvious OCR mistakes.

6. Merge information from multiple sections if required.

7. Explain concepts in simple language.

8. Use proper Markdown formatting.

9. Use headings whenever appropriate.

10. Use bullet points whenever possible.

11. If the answer is not found, reply ONLY:

Information not found in the uploaded document.

12. If the question asks:

- Explain
- Describe
- How
- Why

then give a detailed explanation.

13. If the question asks:

- What
- Define
- Meaning

then first give a short definition,
then explain.

14. Keep technical names unchanged.

-------------------------------------------------------

ANSWER
"""

    return generate_response(prompt, provider)


def generate_summary(context, provider):

    prompt = f"""
You are IntelliDoc AI.

You are an expert AI Document Analyst.

Your task is to generate a concise, well-structured summary of the uploaded document.

Use ONLY the information present in the document.

------------------------------------------------------------

RULES

1. Use ONLY the uploaded document.

2. Never use outside knowledge.

3. Never hallucinate or invent information.

4. Correct obvious OCR mistakes.

5. Remove duplicate information.

6. Ignore page numbers, headers and footers.

7. Preserve important technical terms, formulas, numbers and definitions.

8. Rewrite everything naturally instead of copying paragraphs.

9. Use proper Markdown formatting.

10. Keep the summary concise and easy to read.

------------------------------------------------------------

OUTPUT FORMAT

# 📄 Executive Overview

Write a short overview of the document in 5–7 lines.

Explain:
- What the document is about
- Main objective
- Overall learning outcome

------------------------------------------------------------

# 📚 Major Topics

List all major topics covered in the document.

Use bullet points.

------------------------------------------------------------

# 🧠 Key Concepts

Briefly explain each important concept in 2–4 lines.

Do not explain unnecessary details.

------------------------------------------------------------

# 📌 Important Definitions

List only the important definitions present in the document.

------------------------------------------------------------

# ⭐ Key Takeaways

Write 10–15 important learning points.

Use bullet points.

------------------------------------------------------------

DOCUMENT

{context}

------------------------------------------------------------

Generate the summary now.
"""

    return generate_response(prompt, provider)


# ============================================================
# STUDY NOTES 
# ============================================================

def generate_study_notes(context, provider):

    prompt = f"""
You are IntelliDoc AI.

You are an expert professor, technical writer and educator.

Your task is to convert the uploaded document into high-quality study notes for students.

Use ONLY the uploaded document.

------------------------------------------------------------

RULES

1. Never use outside knowledge.

2. Never hallucinate.

3. Correct OCR mistakes naturally.

4. Remove duplicate information.

5. Ignore page numbers, headers and footers.

6. Preserve technical terms.

7. Preserve formulas.

8. Preserve important numbers.

9. Rewrite in simple language.

10. Use proper Markdown formatting.

------------------------------------------------------------

OUTPUT FORMAT

# 📘 Study Notes

## 📖 Overview

Write a short overview of the document.

------------------------------------------------------------

## 📚 Important Topics

List all major topics.

------------------------------------------------------------

## 🧠 Detailed Notes

Explain every important topic using:

- Headings
- Bullet points
- Short paragraphs

------------------------------------------------------------

## 📌 Important Definitions

Collect all important definitions together.

------------------------------------------------------------

## ⚙️ Algorithms / Methods

If present, explain:

- Purpose

- Working

- Steps

- Advantages

------------------------------------------------------------

## 📝 Important Formulas

Include every important formula from the document.

------------------------------------------------------------

## ⭐ Important Points to Remember

Write 15–20 quick revision points.

------------------------------------------------------------

## 🎯 Exam Tips

Mention topics that students should focus on for exams.

------------------------------------------------------------

DOCUMENT

{context}

------------------------------------------------------------

Generate the study notes now.
"""

    return generate_response(prompt, provider)




# ============================================================
# FLASHCARDS
# ============================================================

def generate_flashcards(context, provider):

    prompt = f"""
You are IntelliDoc AI.

Your task is to generate flashcards ONLY from the uploaded document.

STRICT RULES:

- Use ONLY information from the document.
- DO NOT use external knowledge.
- DO NOT hallucinate.
- DO NOT explain anything outside the flashcards.
- Return ONLY Markdown.
- Follow the format EXACTLY.
- Never use "Front", "Back", "Question:", "Answer:", bullet points, or any other format.
- Never change the headings.

OUTPUT FORMAT (STRICT)

# 📚 Flashcards

## Card 1

**Q:** Question here

**A:** Answer here

---

## Card 2

**Q:** Question here

**A:** Answer here

---

Generate between 15 and 20 flashcards.

DOCUMENT:

{context}

IMPORTANT:
DO NOT SUMMARIZE THE DOCUMENT.
DO NOT WRITE NOTES.
ONLY RETURN FLASHCARDS.
IF YOU DO NOT FOLLOW THE FORMAT, YOUR ANSWER IS WRONG.
"""

    return generate_response(prompt, provider)



def generate_question_bank(context, provider):

    prompt = f"""
You are IntelliDoc AI.

Generate a Question Bank ONLY from the uploaded document.

Rules:
- Use ONLY the document.
- Do NOT use outside knowledge.
- Do NOT hallucinate.
- Generate 20 important exam-oriented questions.
- Include Easy, Medium, and Hard questions.
- Use Markdown.

Format:

# 📘 Question Bank

## Easy
1. Question
2. Question

## Medium
1. Question
2. Question

## Hard
1. Question
2. Question

Document:

{context}
"""

    return generate_response(prompt, provider)


def generate_faq(context, provider):

    prompt = f"""
You are IntelliDoc AI.

Generate Frequently Asked Questions ONLY from the uploaded document.

Rules:
- Use ONLY the uploaded document.
- Do NOT hallucinate.
- Generate 15 important FAQs.
- Each FAQ must contain one question and one answer.
- Use Markdown.

Format:

# Frequently Asked Questions

## Q1
Question:

Answer:

## Q2
Question:

Answer:

Document:

{context}
"""

    return generate_response(prompt, provider)


def generate_meeting_notes(context, provider):

    prompt = f"""
You are IntelliDoc AI.

Generate professional Meeting Notes ONLY from the uploaded document.

Rules:
- Use ONLY the uploaded document.
- Do NOT hallucinate.
- If information is unavailable, write "Not Mentioned".
- Use Markdown.

Format:

# Meeting Notes

## Meeting Title

## Date

## Participants

## Agenda

## Discussion Points

## Decisions Taken

## Action Items

## Next Steps

Document:

{context}
"""

    return generate_response(prompt, provider)


def generate_research_notes(context, provider):

    prompt = f"""
You are IntelliDoc AI.

Generate professional Research Notes ONLY from the uploaded document.

Rules:
- Use ONLY the uploaded document.
- Do NOT hallucinate.
- If information is unavailable, write "Not Mentioned".
- Use Markdown.

Format:

# Research Notes

## Research Topic

## Objective

## Key Concepts

## Methodology

## Important Findings

## Advantages

## Limitations

## Conclusion

## Future Scope

Document:

{context}
"""

    return generate_response(prompt, provider)

# ============================================================
# PARTIAL SUMMARY
# ============================================================

def generate_partial_summary(context):

    prompt = f"""
You are IntelliDoc AI.

You are reading only ONE PART of a larger document.

Your job is to summarize ONLY the information present below.

Rules:

1. Do NOT use outside knowledge.

2. Do NOT hallucinate.

3. Do NOT guess missing information.

4. Correct obvious OCR mistakes.

5. Preserve important names, headings, numbers and technical terms.

6. Ignore repetition.

7. Write 5-10 bullet points.

8. Keep every important point.

----------------------------------

DOCUMENT PART

{context}

----------------------------------

SUMMARY
"""

    return call_llm(prompt)


def generate_document_comparison(
    context1,
    context2,
    provider
):

    prompt = f"""
You are IntelliDoc AI.

You are an expert document comparison assistant.

Compare ONLY the two uploaded documents.

Never use outside knowledge.
Never hallucinate.
Use only the information present in both documents.

------------------------------------------------------------

DOCUMENT 1

{context1}

------------------------------------------------------------

DOCUMENT 2

{context2}

------------------------------------------------------------

OUTPUT FORMAT

# 📄 Overall Summary

Write a short comparison overview.

------------------------------------------------------------

# ✅ Similarities

List all major similarities.

------------------------------------------------------------

# ❌ Differences

List all major differences.

------------------------------------------------------------

# 📚 Common Topics

Mention topics present in both documents.

------------------------------------------------------------

# ⭐ Unique Topics

### Document 1

Mention topics only present in Document 1.

### Document 2

Mention topics only present in Document 2.

------------------------------------------------------------

# 📊 Comparison Table

| Feature | Document 1 | Document 2 |

Fill the table using Markdown.

------------------------------------------------------------

# 🎯 Final Conclusion

Give a concise conclusion in 4–6 lines.

"""

    return generate_response(prompt, provider)