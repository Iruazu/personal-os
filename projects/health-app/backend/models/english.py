from sqlalchemy import Column, Integer, Float, DateTime, String, Text
from datetime import datetime, timezone
from database import Base


class EnglishLog(Base):
    __tablename__ = "english_logs"

    id = Column(Integer, primary_key=True, index=True)
    logged_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    activity_type = Column(String(50), nullable=False)  # speak, reading, listening, writing
    duration_minutes = Column(Integer, nullable=False)
    score = Column(Float, nullable=True)  # 0-100
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
