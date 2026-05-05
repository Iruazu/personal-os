import re
import uuid
import os
from pathlib import Path
from PIL import Image
import pytesseract

IMAGES_DIR = Path("/app/data/images")
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

_PATTERNS = {
    "weight_kg":         r"体重[^\d]*(\d+\.?\d*)",
    "muscle_kg":         r"筋肉量[^\d]*(\d+\.?\d*)",
    "fat_kg":            r"体脂肪量[^\d]*(\d+\.?\d*)",
    "fat_percent":       r"体脂肪率[^\d]*(\d+\.?\d*)",
    "bmi":               r"BMI[^\d]*(\d+\.?\d*)",
    "visceral_fat_level": r"内臓脂肪[^\d]*(\d+)",
}


def save_image(data: bytes, suffix: str = ".jpg") -> str:
    filename = f"{uuid.uuid4()}{suffix}"
    path = IMAGES_DIR / filename
    path.write_bytes(data)
    return str(path)


def extract_inbody(image_path: str) -> dict:
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img, lang="jpn+eng")

    result: dict = {"raw_ocr_text": text}
    for field, pattern in _PATTERNS.items():
        m = re.search(pattern, text)
        if m:
            val = float(m.group(1))
            result[field] = int(val) if field == "visceral_fat_level" else val

    return result
