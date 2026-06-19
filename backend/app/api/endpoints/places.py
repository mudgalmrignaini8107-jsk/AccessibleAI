from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_places():
    return {"message": "Places search endpoint is active."}

@router.get("/routes")
async def get_routes():
    return {"message": "Route accessibility engine is active."}
