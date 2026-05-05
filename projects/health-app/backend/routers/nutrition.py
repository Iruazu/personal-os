from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional
from database import get_db
from models.nutrition import NutritionLog
from services.llm import evaluate_nutrition

router = APIRouter(prefix="/nutrition", tags=["nutrition"])


class NutritionIn(BaseModel):
    meal_description: str = Field(min_length=1, max_length=1000)
    calories: Optional[float] = Field(None, ge=0, le=10000)
    protein_g: Optional[float] = Field(None, ge=0, le=1000)
    carbs_g: Optional[float] = Field(None, ge=0, le=1000)
    fat_g: Optional[float] = Field(None, ge=0, le=1000)


class NutritionOut(BaseModel):
    id: int
    logged_at: datetime
    meal_description: str
    calories: Optional[float]
    protein_g: Optional[float]
    carbs_g: Optional[float]
    fat_g: Optional[float]
    llm_feedback: Optional[str]

    model_config = {"from_attributes": True}


@router.post("/logs", response_model=NutritionOut, status_code=201)
async def create_log(body: NutritionIn, db: Session = Depends(get_db)):
    try:
        feedback = await evaluate_nutrition(body.meal_description)
    except Exception:
        feedback = None

    log = NutritionLog(
        logged_at=datetime.now(timezone.utc),
        meal_description=body.meal_description,
        calories=body.calories,
        protein_g=body.protein_g,
        carbs_g=body.carbs_g,
        fat_g=body.fat_g,
        llm_feedback=feedback,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/logs", response_model=list[NutritionOut])
def list_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return db.query(NutritionLog).order_by(NutritionLog.logged_at.desc()).offset(offset).limit(limit).all()


@router.delete("/logs/{log_id}", status_code=204)
def delete_log(log_id: int, db: Session = Depends(get_db)):
    log = db.get(NutritionLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
