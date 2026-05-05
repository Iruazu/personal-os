from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional, Literal
from database import get_db
from models.english import EnglishLog

router = APIRouter(prefix="/english", tags=["english"])

ActivityType = Literal["speak", "reading", "listening", "writing"]


class EnglishIn(BaseModel):
    activity_type: ActivityType
    duration_minutes: int = Field(ge=1, le=480)
    score: Optional[float] = Field(None, ge=0, le=100)
    note: Optional[str] = Field(None, max_length=500)


class EnglishOut(BaseModel):
    id: int
    logged_at: datetime
    activity_type: str
    duration_minutes: int
    score: Optional[float]
    note: Optional[str]

    model_config = {"from_attributes": True}


class WeeklyStats(BaseModel):
    week: str
    total_minutes: int
    activity_type: str


class ActivityBreakdown(BaseModel):
    activity_type: str
    total_minutes: int


@router.post("/logs", response_model=EnglishOut, status_code=201)
def create_log(body: EnglishIn, db: Session = Depends(get_db)):
    log = EnglishLog(
        logged_at=datetime.now(timezone.utc),
        activity_type=body.activity_type,
        duration_minutes=body.duration_minutes,
        score=body.score,
        note=body.note,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/logs", response_model=list[EnglishOut])
def list_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return db.query(EnglishLog).order_by(EnglishLog.logged_at.desc()).offset(offset).limit(limit).all()


@router.delete("/logs/{log_id}", status_code=204)
def delete_log(log_id: int, db: Session = Depends(get_db)):
    log = db.get(EnglishLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()


@router.get("/weekly", response_model=list[WeeklyStats])
def weekly_stats(
    limit: int = Query(12, ge=1, le=52),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            func.strftime("%Y-W%W", EnglishLog.logged_at).label("week"),
            EnglishLog.activity_type,
            func.sum(EnglishLog.duration_minutes).label("total_minutes"),
        )
        .group_by("week", EnglishLog.activity_type)
        .order_by("week")
        .limit(limit * 4)
        .all()
    )
    return [WeeklyStats(week=r.week, activity_type=r.activity_type, total_minutes=int(r.total_minutes)) for r in rows]


@router.get("/breakdown", response_model=list[ActivityBreakdown])
def activity_breakdown(db: Session = Depends(get_db)):
    rows = (
        db.query(EnglishLog.activity_type, func.sum(EnglishLog.duration_minutes).label("total_minutes"))
        .group_by(EnglishLog.activity_type)
        .all()
    )
    return [ActivityBreakdown(activity_type=r.activity_type, total_minutes=int(r.total_minutes)) for r in rows]
