from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False) # Cafe, Hospital, Park, College, Station, Mall
    address = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    
    # Accessibility parameters
    has_ramp = Column(Boolean, default=False)
    has_elevator = Column(Boolean, default=False)
    has_handrail = Column(Boolean, default=False)
    has_accessible_washroom = Column(Boolean, default=False)
    has_nursing_room = Column(Boolean, default=False)
    has_step_free_entrance = Column(Boolean, default=False)
    stair_count = Column(Integer, default=0)
    has_seating = Column(Boolean, default=False)
    has_parking = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)

    # Relationships
    reviews = relationship("Review", back_populates="place", cascade="all, delete-orphan")
    accessibility_reports = relationship("AccessibilityReport", back_populates="place", cascade="all, delete-orphan")
    verification_reports = relationship("VerificationReport", back_populates="place", cascade="all, delete-orphan")
