from fastapi import APIRouter

router = APIRouter()

@router.get("/calculate")
async def calculate_score():
    return {"message": "Scoring calculation endpoint is active."}
