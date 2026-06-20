from fastapi import APIRouter, UploadFile, File, HTTPException
from app.cv.detector import AccessibilityDetector

router = APIRouter()
detector = AccessibilityDetector()

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Accepts an uploaded image of a public place street view, runs the 
    OpenCV heuristic accessibility engine, and returns detected markers and box coordinates.
    """
    # Verify file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload an image file (JPEG, PNG, WEBP)."
        )

    try:
        # Read uploaded image bytes
        image_bytes = await file.read()
        
        # Analyze using our CV engine
        result = detector.analyze_image(image_bytes)
        
        if not result.get("success", False):
            raise HTTPException(
                status_code=422,
                detail=result.get("error", "Failed to process image.")
            )
            
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during image analysis: {str(e)}"
        )
