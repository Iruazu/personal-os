import re
import uuid
import logging
from pathlib import Path

from PIL import Image, ImageOps, ImageEnhance, ImageFilter
import pytesseract

logger = logging.getLogger(__name__)

IMAGES_DIR = Path("/app/data/images")

_PATTERNS: dict[str, str] = {
    # (?!調節) avoids matching 体重調節 (+33kg adjustment line)
    "weight_kg":          r"体重(?!調節)[\s\S]{0,60}?(\d+\.?\d*)",
    # Soft Lean Mass label is more reliably OCR'd than the bar-chart 筋肉量 line
    "muscle_kg":          r"Soft Lean(?:\s*Ma\w*)?[\s\S]{0,60}?(\d+\.?\d*)",
    "fat_kg":             r"体脂肪量[\s\S]{0,30}?(\d+\.?\d*)",
    "fat_percent":        r"体脂肪率[\s\S]{0,50}?(\d+\.?\d*)",
    "bmi":                r"BMI[\s\S]{0,30}?(\d+\.?\d*)",
    "visceral_fat_level": r"内臓脂肪[\s\S]{0,15}?(\d+)",
}

_RANGES: dict[str, tuple[float, float]] = {
    "weight_kg":          (20.0, 250.0),
    "muscle_kg":          (5.0,  120.0),
    "fat_kg":             (1.0,  150.0),
    "fat_percent":        (1.0,   60.0),
    "bmi":                (10.0,  50.0),
    "visceral_fat_level": (1,     30),
}

_REQUIRED_FIELDS = {"weight_kg", "fat_percent"}

_TESSERACT_CONFIG = "--oem 3 --psm 3"

_ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}


def save_image(data: bytes, suffix: str = ".jpg") -> str:
    if suffix not in _ALLOWED_SUFFIXES:
        raise ValueError(f"Unsupported image suffix: {suffix!r}")
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4()}{suffix}"
    path = IMAGES_DIR / filename
    path.write_bytes(data)
    return str(path)


def _preprocess(img: Image.Image) -> Image.Image:
    img = ImageOps.exif_transpose(img)
    img = img.convert("L")

    min_side = 1500
    w, h = img.size
    if min(w, h) < min_side:
        scale = min_side / min(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    img = ImageEnhance.Contrast(img).enhance(2.0)
    img = ImageEnhance.Sharpness(img).enhance(2.0)
    img = img.filter(ImageFilter.MedianFilter(size=3))
    img = ImageEnhance.Sharpness(img).enhance(1.5)

    return img


def _recover(val: float, lo: float, hi: float) -> float | None:
    """Return val if in range; try val/10 to recover missing decimal points (e.g. 559 → 55.9)."""
    if lo <= val <= hi:
        return val
    recovered = round(val / 10, 1)
    if lo <= recovered <= hi:
        return recovered
    return None


def _match_all(text: str) -> dict[str, float | int]:
    result: dict[str, float | int] = {}
    for field, pattern in _PATTERNS.items():
        m = re.search(pattern, text)
        if not m:
            continue
        try:
            val = float(m.group(1))
        except ValueError:
            logger.debug("OCR float conversion failed for %s: %r", field, m.group(1))
            continue
        lo, hi = _RANGES[field]
        recovered = _recover(val, lo, hi)
        if recovered is None:
            logger.debug("OCR range rejected %s=%.1f (valid: %.1f–%.1f)", field, val, lo, hi)
            continue
        result[field] = int(recovered) if field == "visceral_fat_level" else recovered
    return result


def extract_inbody(image_path: str) -> dict[str, float | int | str]:
    try:
        img = Image.open(image_path)
    except (FileNotFoundError, OSError) as e:
        logger.error("Failed to open image %s: %s", image_path, e)
        raise

    img = _preprocess(img)

    try:
        text = pytesseract.image_to_string(img, lang="jpn+eng", config=_TESSERACT_CONFIG)
    except pytesseract.TesseractError as e:
        logger.error("Tesseract error: %s", e)
        raise

    matched = _match_all(text)

    # Retry without custom config if required fields are missing
    if not _REQUIRED_FIELDS.issubset(matched):
        logger.debug("Required fields missing %s, retrying with default config",
                     _REQUIRED_FIELDS - matched.keys())
        try:
            text2 = pytesseract.image_to_string(img, lang="jpn+eng")
        except pytesseract.TesseractError:
            text2 = ""
        matched2 = _match_all(text2)
        if len(matched2) > len(matched):
            text = text2
            matched = matched2

    return {"raw_ocr_text": text, **matched}
