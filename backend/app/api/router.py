from fastapi import APIRouter
from app.api.endpoints import places, cv, scoring

api_router = APIRouter()

api_router.include_router(places.router, prefix="/places", tags=["places"])
api_router.include_router(cv.router, prefix="/cv", tags=["cv"])
api_router.include_router(scoring.router, prefix="/scoring", tags=["scoring"])
