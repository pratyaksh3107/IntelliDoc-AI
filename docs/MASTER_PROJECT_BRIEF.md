# IntelliDoc AI

## Project Vision

IntelliDoc AI is an AI-powered Document Intelligence and Knowledge Assistant inspired by NotebookLM, ChatPDF, and Memory AI.

The goal is to allow users to upload documents, extract information, perform semantic search, and interact with documents using AI-powered question answering.

This project is being developed as a Capstone Project and follows the concepts learned during the internship.

---

## Final Tech Stack

Frontend:
- React
- Vite

Backend:
- FastAPI

AI / ML:
- Python
- Sentence Transformers
- Google Gemini

Vector Database:
- ChromaDB

Core AI Concepts:
- Embeddings
- Semantic Search
- Retrieval Augmented Generation (RAG)

Future Components:
- Multi-document Chat
- AI Report Generation
- PDF Summarization
- Quiz Generation

---

## Development Rule

Build step-by-step.

Do not skip phases.

Every feature must be understandable before implementation.

Project must remain resume-worthy and industry relevant.

---

# Project Status

Current Version: v1.0

Status: Completed

Completed Features:

- PDF Upload
- PDF Storage
- PDF Text Extraction
- Document Metadata Extraction
- Text Chunking
- Embedding Generation
- ChromaDB Integration
- Semantic Search
- Gemini Integration
- RAG Question Answering

---

# Current Architecture

Frontend (React)

- Upload PDF
- View Uploaded Documents
- Search Documents
- Ask Questions

Backend (FastAPI)

- Receive PDF
- Save PDF
- Extract Text
- Create Chunks
- Generate Embeddings
- Store in ChromaDB
- Retrieve Relevant Chunks
- Generate AI Answers

AI Pipeline

User Question
↓
Embedding Generation
↓
Semantic Search (ChromaDB)
↓
Relevant Context Retrieval
↓
Gemini Flash Latest
↓
Final Answer

---

# API Endpoints

GET /

POST /upload

GET /documents

GET /semantic-search

GET /ask

---

# Next Phase

Planned Features:

1. Chat Interface
2. Chat History
3. PDF Summarization
4. Notes Generation
5. Quiz Generation
6. Downloadable Reports

---

# Learning Outcomes

- FastAPI Architecture
- React Integration
- API Development
- PDF Processing
- Embeddings
- Vector Databases
- ChromaDB
- Semantic Search
- RAG
- Gemini API Integration