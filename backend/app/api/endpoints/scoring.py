from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.scoring.engine import ScoringEngine

router = APIRouter()

class FeatureSchema(BaseModel):
    has_ramp: bool = False
    has_elevator: bool = False
    has_handrail: bool = False
    has_accessible_washroom: bool = False
    has_nursing_room: bool = False
    has_step_free_entrance: bool = False
    stair_count: int = 0
    has_seating: bool = False
    has_parking: bool = False
    is_verified: bool = False

class ScoreRequest(BaseModel):
    features: FeatureSchema
    profile: str = "none"

@router.post("/calculate")
async def calculate_score(request: ScoreRequest):
    """
    Accepts place features and active passport profile, and returns 
    the recalculated Accessibility Index (0-100), grade, barriers, and suggestions.
    """
    valid_profiles = ["none", "wheelchair", "senior", "stroller", "injury", "mother"]
    if request.profile not in valid_profiles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid profile. Supported profiles: {', '.join(valid_profiles)}"
        )

    try:
        # Convert Pydantic features model to dict
        features_dict = request.features.model_dump()
        
        # Calculate score using our engine
        score_data = ScoringEngine.calculate_accessibility_index(features_dict, request.profile)
        
        return score_data
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during scoring calculation: {str(e)}"
        )
