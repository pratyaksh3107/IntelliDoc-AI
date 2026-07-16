# IntelliDoc AI

## Project Overview

IntelliDoc AI is an AI-powered Document Intelligence and Knowledge Assistant developed as a B.Tech AI & Data Science Capstone Project.

The project is inspired by modern AI document platforms such as:

- ChatPDF
- NotebookLM
- Memory AI

IntelliDoc AI enables users to upload PDF documents, extract information, perform semantic search, and interact with their documents using Retrieval-Augmented Generation (RAG).

The project has been built step-by-step to understand the complete AI application development lifecycle rather than simply integrating pre-built solutions.

---

# Developer Information

**Developer:** Pratyaksh Mathur

**Branch:** AI & Data Science

**College:** Poornima College of Engineering, Jaipur

**Project Type:** AI Capstone Project

---

# Current Project Status

## Version 1.0 (Completed)

### Frontend

- React + Vite Setup
- Hero Section
- Upload Section
- PDF Upload UI
- Document Library UI
- Semantic Search UI
- AI Question Input UI

### Backend

- FastAPI Setup
- Upload API
- Document API
- Semantic Search API
- Ask Question API
- CORS Configuration
- Router-Based Architecture

### Document Processing

- PDF Upload
- PDF Reading
- Text Extraction
- Page Count
- Document Metadata
- Text Chunking

### AI Features

- Embedding Generation
- ChromaDB Vector Database
- Semantic Search
- Gemini Integration
- Retrieval-Augmented Generation (RAG)
- AI-Powered Question Answering

---

# Current Workflow

```text
PDF Upload
     ↓
FastAPI Receives PDF
     ↓
PDF Text Extraction
     ↓
Chunk Creation
     ↓
Embedding Generation
     ↓
Store in ChromaDB
     ↓
User Question
     ↓
Semantic Search
     ↓
Relevant Chunks Retrieved
     ↓
Gemini Flash Latest
     ↓
AI Generated Answer
```

---

# Project Folder Structure

```text
IntelliDoc-AI
│
├── backend
│   ├── app
│   │   ├── routes
│   │   ├── services
│   │   ├── models
│   │   └── main.py
│   │
│   ├── uploads
│   └── requirements.txt
│
├── frontend
│
├── docs
│
├── notebooks
│
├── uploads
│
├── generated_reports
│
├── vector_db
│
└── README.md
```

---

# Folder Usage

## backend/uploads

Purpose:

Store uploaded PDF files received from the application.

Examples:

```text
uploads/
├── Machine_Learning_Notes.pdf
├── RAG_Architecture.pdf
├── Deep_Learning_Week4.pdf
```

---

## vector_db

Purpose:

Store ChromaDB persistent vector database.

Current Usage:

```text
PDF Text
     ↓
Chunks
     ↓
Embeddings
     ↓
ChromaDB
     ↓
Semantic Search
```

The vector database remains available even after backend restarts.

---

## generated_reports

Purpose:

Future storage location for AI-generated reports, summaries, notes, and exported content.

Planned Examples:

```text
generated_reports/
├── summary_ml.pdf
├── notes_dl.pdf
├── report_001.pdf
```

Current Status:

Reserved for future implementation.

---

## notebooks

Purpose:

Research, experimentation, testing, and model exploration.

Possible Usage:

- Embedding Experiments
- ChromaDB Testing
- Gemini Testing
- RAG Experiments
- Dataset Analysis

Current Status:

Reserved for future experimentation.

---

## docs

Purpose:

Store project documentation.

Contains:

- MASTER_PROJECT_BRIEF.md
- PROJECT_RULES.md
- LEARNING_PROGRESS.md
- Additional documentation files

---

# Technologies Used

## Frontend

- React
- Vite
- JavaScript

---

## Backend

- FastAPI
- Uvicorn
- Python

---

## PDF Processing

- PyPDF

---

## AI & Machine Learning

- Sentence Transformers
- all-MiniLM-L6-v2

---

## Vector Database

- ChromaDB

---

## Large Language Model

- Google Gemini Flash Latest

---

# API Endpoints

## Home

```http
GET /
```

Response:

```json
{
  "message": "IntelliDoc AI Backend Running"
}
```

---

## Upload PDF

```http
POST /upload
```

Purpose:

Upload PDF files for processing.

---

## Document Library

```http
GET /documents
```

Purpose:

Retrieve uploaded documents.

---

## Semantic Search

```http
GET /semantic-search
```

Example:

```http
/semantic-search?query=What is RAG?
```

Purpose:

Retrieve relevant chunks from uploaded documents.

---

## Ask Questions

```http
GET /ask
```

Example:

```http
/ask?question=What is RAG?
```

Purpose:

Perform Retrieval-Augmented Generation using ChromaDB and Gemini.

---

# Service Architecture

## pdf_service.py

Responsibilities:

- Read PDF files
- Extract text
- Count pages

---

## chunk_service.py

Responsibilities:

- Create text chunks
- Search chunks

---

## embedding_service.py

Responsibilities:

- Load Sentence Transformer model
- Generate embeddings

---

## vector_service.py

Responsibilities:

- Store embeddings
- Perform semantic search
- Retrieve relevant context

---

## document_service.py

Responsibilities:

- Manage uploaded documents

---

## llm_service.py

Responsibilities:

- Connect with Gemini
- Generate AI responses

---

# Development Journey

## Phase 1

### React Frontend

Learned:

- Components
- JSX
- useState
- Event Handling

Built:

- Hero Section
- Upload UI

---

## Phase 2

### FastAPI Backend

Learned:

- Routes
- File Upload APIs
- Request Handling

Built:

- Upload Endpoint
- Backend Server

---

## Phase 3

### PDF Processing

Built:

- PDF Upload
- PDF Reading
- Text Extraction
- Metadata Extraction

---

## Phase 4

### Chunking

Built:

- Text Chunking
- Chunk Storage
- Keyword Search

---

## Phase 5

### Embeddings

Built:

- Sentence Transformer Integration
- Embedding Generation

Learned:

- Vector Representations
- Text Embeddings

---

## Phase 6

### ChromaDB

Built:

- Vector Storage
- Persistent Database

Learned:

- Vector Databases
- Similarity Search

---

## Phase 7

### Semantic Search

Built:

- Semantic Retrieval
- Relevant Context Retrieval

Learned:

- Cosine Similarity
- Context Retrieval

---

## Phase 8

### Gemini Integration

Built:

- Gemini API Integration
- AI Response Generation

Learned:

- Prompt Engineering
- LLM Integration

---

## Phase 9

### RAG Pipeline

Built:

- Retrieval-Augmented Generation
- Question Answering System

Learned:

- End-to-End AI Systems
- RAG Architecture

---

# Problems Faced & Solutions

## Problem 1: CORS Error

Issue:

Frontend and Backend were running on different ports.

Solution:

Configured FastAPI CORS Middleware.

Learning:

Cross-Origin communication in Full Stack applications.

---

## Problem 2: Chunks Lost After Restart

Issue:

Memory-based chunk storage disappeared after backend restart.

Solution:

Implemented ChromaDB persistent storage.

Learning:

Importance of persistent vector databases.

---

## Problem 3: Gemini Model Compatibility

Issue:

Initial Gemini model produced API errors.

Solution:

Switched to:

```python
gemini-flash-latest
```

Learning:

Always validate model availability before integration.

---

## Problem 4: Semantic Search Integration

Issue:

Need to connect embeddings with vector search.

Solution:

Integrated Sentence Transformers with ChromaDB.

Learning:

End-to-End Retrieval Systems.

---

# Important Concepts Learned

## React

- Components
- JSX
- useState
- Fetch API
- Frontend Development

---

## FastAPI

- Routers
- Services
- File Uploads
- API Development

---

## Artificial Intelligence

- Text Embeddings
- Vector Databases
- Semantic Search
- Retrieval-Augmented Generation
- Large Language Models

---

# Future Roadmap

## Version 1.1

- Chat Interface
- Loading Indicators
- Better UI/UX

---

## Version 1.2

- Chat History
- Source References
- Multi-PDF Support

---

## Version 1.3

- PDF Summarization
- Notes Generation
- Quiz Generation

---

## Version 2.0

- Multi-Document Intelligence System
- AI Report Generation
- Knowledge Base Management

---

# Final Goal

```text
Upload PDF
      ↓
Extract Text
      ↓
Chunk Creation
      ↓
Embedding Generation
      ↓
Store in ChromaDB
      ↓
Ask Questions
      ↓
Retrieve Context
      ↓
Gemini Generates Answer
      ↓
Intelligent Document Assistant
```

Similar to:

- ChatPDF
- NotebookLM
- Memory AI

---

# Personal Note

This project was intentionally built step-by-step instead of copying complete solutions from the internet.

The objective was to understand and implement:

- React
- FastAPI
- Document Processing
- Embeddings
- ChromaDB
- Semantic Search
- Gemini API
- Retrieval-Augmented Generation (RAG)
- Full Stack AI Development

Every major concept was implemented and understood before moving to the next stage.

The project represents both a learning journey and a practical implementation of modern AI-powered document intelligence systems.