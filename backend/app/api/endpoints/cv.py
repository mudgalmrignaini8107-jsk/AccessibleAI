from fastapi import APIRouter

router = APIRouter()

@router.post("/analyze")
async def analyze_image():
    return {"message": "CV analysis endpoint is active."}
