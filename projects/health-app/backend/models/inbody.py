from sqlalchemy import Column, Integer, Float, DateTime, String
from datetime import datetime, timezone
from database import Base


class InBodyRecord(Base):
    __tablename__ = "inbody_records"

    id = Column(Integer, primary_key=True, index=True)
    measured_at = Column(DateTime, nullable=False)
    weight_kg = Column(Float, nullable=True)
    muscle_kg = Column(Float, nullable=True)
    fat_kg = Column(Float, nullable=True)
    fat_percent = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)
    visceral_fat_level = Column(Integer, nullable=True)
    image_path = Column(String(255), nullable=True)
    raw_ocr_text = Column(String(2000), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
