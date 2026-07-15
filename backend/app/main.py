from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.upload_routes import router as upload_router
from app.routes.search_routes import router as search_router
from app.routes.document_routes import router as document_router

app = FastAPI()

app.include_router(upload_router)
app.include_router(search_router)
app.include_router(document_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "IntelliDoc AI Backend Running"}