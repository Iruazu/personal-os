from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional
from database import get_db
from models.inbody import InBodyRecord
from services.ocr import save_image, extract_inbody

router = APIRouter(prefix="/inbody", tags=["inbody"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


class InBodyOut(BaseModel):
    id: int
    measured_at: datetime
    weight_kg: Optional[float]
    muscle_kg: Optional[float]
    fat_kg: Optional[float]
    fat_percent: Optional[float]
    bmi: Optional[float]
    visceral_fat_level: Optional[int]
    raw_ocr_text: Optional[str]

    model_config = {"from_attributes": True}


class InBodyPatch(BaseModel):
    weight_kg: Optional[float] = Field(None, ge=0, le=500)
    muscle_kg: Optional[float] = Field(None, ge=0, le=300)
    fat_kg: Optional[float] = Field(None, ge=0, le=300)
    fat_percent: Optional[float] = Field(None, ge=0, le=100)
    bmi: Optional[float] = Field(None, ge=0, le=100)
    visceral_fat_level: Optional[int] = Field(None, ge=0, le=30)


@router.post("/upload", response_model=InBodyOut, status_code=201)
async def upload_inbody(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="JPEG / PNG / WebP のみ対応")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="ファイルサイズは10MB以下にしてください")

    suffix = "." + (file.content_type or "image/jpeg").split("/")[-1]
    image_path = save_image(data, suffix)

    try:
        ocr_result = extract_inbody(image_path)
    except Exception:
        ocr_result = {"raw_ocr_text": "OCR失敗 — 手動で値を入力してください"}

    record = InBodyRecord(
        measured_at=datetime.now(timezone.utc),
        image_path=image_path,
        **{k: v for k, v in ocr_result.items() if k != "raw_ocr_text"},
        raw_ocr_text=ocr_result.get("raw_ocr_text"),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/records", response_model=list[InBodyOut])
def list_records(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return db.query(InBodyRecord).order_by(InBodyRecord.measured_at.desc()).limit(limit).all()


@router.patch("/records/{record_id}", response_model=InBodyOut)
def patch_record(record_id: int, body: InBodyPatch, db: Session = Depends(get_db)):
    record = db.get(InBodyRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/records/{record_id}", status_code=204)
def delete_record(record_id: int, db: Session = Depends(get_db)):
    record = db.get(InBodyRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
