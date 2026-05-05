from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
from database import get_db
from models.workout import WorkoutSession, Exercise

router = APIRouter(prefix="/workout", tags=["workout"])


class ExerciseIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    set_number: int = Field(ge=1, le=100)
    weight_kg: float = Field(ge=0, le=1000)
    reps: int = Field(ge=1, le=1000)

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be blank")
        return v.strip()


class SessionIn(BaseModel):
    date: datetime
    note: Optional[str] = Field(None, max_length=500)
    exercises: list[ExerciseIn] = Field(min_length=1)


class ExerciseOut(BaseModel):
    id: int
    name: str
    set_number: int
    weight_kg: float
    reps: int

    model_config = {"from_attributes": True}


class SessionOut(BaseModel):
    id: int
    date: datetime
    note: Optional[str]
    exercises: list[ExerciseOut]

    model_config = {"from_attributes": True}


class VolumePoint(BaseModel):
    date: str
    total_volume: float
    exercise_name: str


@router.post("/sessions", response_model=SessionOut, status_code=201)
def create_session(body: SessionIn, db: Session = Depends(get_db)):
    session = WorkoutSession(date=body.date, note=body.note)
    db.add(session)
    db.flush()

    for ex in body.exercises:
        db.add(Exercise(
            session_id=session.id,
            name=ex.name,
            set_number=ex.set_number,
            weight_kg=ex.weight_kg,
            reps=ex.reps,
        ))

    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions", response_model=list[SessionOut])
def list_sessions(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return db.query(WorkoutSession).order_by(WorkoutSession.date.desc()).offset(offset).limit(limit).all()


@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(session_id: int, db: Session = Depends(get_db)):
    session = db.get(WorkoutSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()


@router.get("/volume", response_model=list[VolumePoint])
def get_volume_trend(
    exercise_name: str = Query(min_length=1, max_length=100),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            func.date(WorkoutSession.date).label("date"),
            func.sum(Exercise.weight_kg * Exercise.reps).label("total_volume"),
        )
        .join(Exercise, Exercise.session_id == WorkoutSession.id)
        .filter(Exercise.name == exercise_name)
        .group_by(func.date(WorkoutSession.date))
        .order_by(func.date(WorkoutSession.date).desc())
        .limit(limit)
        .all()
    )
    return [VolumePoint(date=str(r.date), total_volume=float(r.total_volume), exercise_name=exercise_name) for r in rows]


@router.get("/exercises/names", response_model=list[str])
def list_exercise_names(db: Session = Depends(get_db)):
    rows = db.query(Exercise.name).distinct().order_by(Exercise.name).all()
    return [r.name for r in rows]
