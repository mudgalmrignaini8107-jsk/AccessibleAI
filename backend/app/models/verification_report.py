import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class VerificationReport(Base):
    __tablename__ = "verification_reports"

    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(Integer, ForeignKey("places.id", ondelete="CASCADE"), nullable=False)
    inspector = Column(String, default="Vision AI Engine")
    image_url = Column(String, nullable=False)
    
    # Vision engine detections
    ramp_detected = Column(Boolean, default=False)
    stairs_detected = Column(Boolean, default=False)
    handrail_detected = Column(Boolean, default=False)
    elevator_detected = Column(Boolean, default=False)
    
    confidence_score = Column(Float, default=1.0)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    place = relationship("Place", back_populates="verification_reports")
