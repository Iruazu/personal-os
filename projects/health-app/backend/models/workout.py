from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    note = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    exercises = relationship("Exercise", back_populates="session", cascade="all, delete-orphan", lazy="selectin")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    name = Column(String(100), nullable=False)
    set_number = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=False)
    reps = Column(Integer, nullable=False)

    session = relationship("WorkoutSession", back_populates="exercises")
