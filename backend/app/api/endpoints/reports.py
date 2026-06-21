from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List
from app.database.connection import get_db
from app.models.accessibility_report import AccessibilityReport
from app.models.verification_report import VerificationReport
from app.models.place import Place
from app.cv.detector import AccessibilityDetector

router = APIRouter()
detector = AccessibilityDetector()

class ReportCreateSchema(BaseModel):
    reporter: str = Field(default="Community Member", max_length=50)
    issue_type: str = Field(..., max_length=100) # e.g. Broken Ramp, Blocked Elevator
    description: str = Field(..., max_length=500)

class ReportResponseSchema(BaseModel):
    id: int
    place_id: int
    reporter: str
    issue_type: str
    description: str
    
    class Config:
        from_attributes = True

class VerificationResponseSchema(BaseModel):
    id: int
    place_id: int
    inspector: str
    image_url: str
    ramp_detected: bool
    stairs_detected: bool
    handrail_detected: bool
    elevator_detected: bool
    confidence_score: float
    is_approved: bool

    class Config:
        from_attributes = True

@router.post("/place/{place_id}/report", response_model=ReportResponseSchema)
async def create_accessibility_report(
    place_id: int, 
    report_in: ReportCreateSchema, 
    db: Session = Depends(get_db)
):
    """
    Submits a user-reported accessibility issue or barrier for a location.
    """
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found.")

    try:
        new_report = AccessibilityReport(
            place_id=place_id,
            reporter=report_in.reporter,
            issue_type=report_in.issue_type,
            description=report_in.description
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        return new_report
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save report: {str(e)}")

@router.post("/place/{place_id}/verify")
async def verify_place_accessibility(
    place_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts an uploaded verification image, processes it using Vision AI,
    creates a verification report, and updates the place features in the database.
    """
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found.")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid upload format. Image required.")

    try:
        # 1. Read file bytes and run CV Detector
        image_bytes = await file.read()
        cv_result = detector.analyze_image(image_bytes)

        if not cv_result.get("success", False):
            raise HTTPException(status_code=422, detail="Vision AI failed to process image.")

        # 2. Extract detected features
        detections = cv_result.get("detections", [])
        ramp_found = any(d["label"] == "ramp" for d in detections)
        stairs_found = any(d["label"] == "stairs" for d in detections)
        handrail_found = any(d["label"] == "handrail" for d in detections)
        elevator_found = any(d["label"] == "elevator" for d in detections)
        
        # Calculate mean confidence
        confs = [d["confidence"] for d in detections]
        mean_conf = sum(confs) / len(confs) if confs else 1.0

        # 3. Update Place features in DB based on detections
        if ramp_found:
            place.has_ramp = True
        if elevator_found:
            place.has_elevator = True
        if handrail_found:
            place.has_handrail = True
        if stairs_found:
            # We don't overwrite if stair count was set, or we can approximate
            place.stair_count = max(place.stair_count, 3) 

        # Badging the place as verified
        place.is_verified = True
        
        # 4. Create and save VerificationReport
        # Use a mock image URL path for local demonstration
        mock_url = f"/uploads/verification_{place_id}_{file.filename}"
        
        v_report = VerificationReport(
            place_id=place_id,
            inspector="Vision AI Engine",
            image_url=mock_url,
            ramp_detected=ramp_found,
            stairs_detected=stairs_found,
            handrail_detected=handrail_found,
            elevator_detected=elevator_found,
            confidence_score=mean_conf,
            is_approved=True
        )

        db.add(v_report)
        db.commit()
        db.refresh(v_report)
        
        return {
            "success": True,
            "detections": detections,
            "annotated_image": cv_result.get("annotated_image"),
            "report": {
                "id": v_report.id,
                "place_id": v_report.place_id,
                "inspector": v_report.inspector,
                "image_url": v_report.image_url,
                "ramp_detected": v_report.ramp_detected,
                "stairs_detected": v_report.stairs_detected,
                "handrail_detected": v_report.handrail_detected,
                "elevator_detected": v_report.elevator_detected,
                "confidence_score": v_report.confidence_score,
                "is_approved": v_report.is_approved
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Verification failure: {str(e)}")
