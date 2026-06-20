import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class AccessibilityReport(Base):
    __tablename__ = "accessibility_reports"

    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(Integer, ForeignKey("places.id", ondelete="CASCADE"), nullable=False)
    reporter = Column(String, default="Community Member")
    issue_type = Column(String, nullable=False) # e.g. Broken Ramp, Blocked Elevator, Missing Signage
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    place = relationship("Place", back_populates="accessibility_reports")
