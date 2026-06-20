import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.database.connection import Base, engine
import app.models # Register all models

# Auto-initialize database tables on server startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Accessible AI Backend API",
    description="Production-ready backend mapping accessibility using AI Computer Vision & Geospatial data",
    version="1.0.0",
)

# Configure CORS for our frontend client
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "*")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount our main API router
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "Accessible AI Backend",
        "version": "1.0.0"
    }
