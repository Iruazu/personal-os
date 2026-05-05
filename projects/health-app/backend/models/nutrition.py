from sqlalchemy import Column, Integer, Float, DateTime, String, Text
from datetime import datetime, timezone
from database import Base


class NutritionLog(Base):
    __tablename__ = "nutrition_logs"

    id = Column(Integer, primary_key=True, index=True)
    logged_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    meal_description = Column(Text, nullable=False)
    calories = Column(Float, nullable=True)
    protein_g = Column(Float, nullable=True)
    carbs_g = Column(Float, nullable=True)
    fat_g = Column(Float, nullable=True)
    llm_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
