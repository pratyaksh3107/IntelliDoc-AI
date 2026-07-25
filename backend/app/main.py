from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.upload_routes import router as upload_router
from app.routes.search_routes import router as search_router
from app.routes.document_routes import router as document_router
from app.routes.ask_routes import router as ask_router
from app.routes.summary_routes import router as summary_router
from app.routes.study_notes_routes import router as study_notes_router
from app.routes.flashcards_routes import router as flashcards_router
from app.routes.question_bank_routes import router as question_bank_router
from app.routes.faq_routes import router as faq_router
from app.routes.meeting_notes_routes import router as meeting_notes_router
from app.routes.research_notes_routes import router as research_notes_router
from app.routes.export_routes import router as export_router
from app.routes.compare_routes import router as compare_router


app = FastAPI(
    title="IntelliDoc AI",
    description="AI Powered Document Intelligence Platform",
    version="1.0.0"
)

app.include_router(study_notes_router)

# ===========================
# Register Routes
# ===========================

app.include_router(upload_router)
app.include_router(search_router)
app.include_router(document_router)
app.include_router(ask_router)
app.include_router(summary_router)
app.include_router(flashcards_router)
app.include_router(question_bank_router)
app.include_router(faq_router)
app.include_router(meeting_notes_router)
app.include_router(research_notes_router)
app.include_router(export_router)
app.include_router(compare_router)

# ===========================
# CORS
# ===========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===========================
# Home
# ===========================

@app.get("/")
def home():

    return {
        "message": "IntelliDoc AI Backend Running 🚀"
    }