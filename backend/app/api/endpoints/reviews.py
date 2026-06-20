from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List
from app.database.connection import get_db
from app.models.review import Review
from app.models.place import Place

router = APIRouter()

class ReviewCreateSchema(BaseModel):
    place_id: int
    author: str = Field(default="Anonymous", max_length=50)
    rating: int = Field(default=5, ge=1, le=5)
    comment: str = Field(..., max_length=500)

class ReviewResponseSchema(BaseModel):
    id: int
    place_id: int
    author: str
    rating: int
    comment: str
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ReviewResponseSchema)
async def create_review(review_in: ReviewCreateSchema, db: Session = Depends(get_db)):
    """
    Submits a new community review for a specific location.
    """
    # Verify place exists
    place = db.query(Place).filter(Place.id == review_in.place_id).first()
    if not place:
        raise HTTPException(
            status_code=404,
            detail=f"Place with ID {review_in.place_id} not found."
        )

    try:
        new_review = Review(
            place_id=review_in.place_id,
            author=review_in.author,
            rating=review_in.rating,
            comment=review_in.comment
        )
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
        return new_review
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit review: {str(e)}"
        )

@router.get("/place/{place_id}", response_model=List[ReviewResponseSchema])
async def get_place_reviews(place_id: int, db: Session = Depends(get_db)):
    """
    Retrieves all community reviews for a given place.
    """
    # Verify place exists
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(
            status_code=404,
            detail=f"Place with ID {place_id} not found."
        )

    reviews = db.query(Review).filter(Review.place_id == place_id).order_by(Review.created_at.desc()).all()
    return reviews
