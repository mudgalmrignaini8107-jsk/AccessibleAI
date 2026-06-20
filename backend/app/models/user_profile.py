from sqlalchemy import Column, Integer, String
from app.database.connection import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    passport_profile = Column(String, default="none") # wheelchair, senior, stroller, injury, mother, none
