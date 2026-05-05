import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import engine, Base
from routers import workout, inbody, nutrition, english

try:
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Health Tracking API", version="1.0.0")

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(workout.router)
app.include_router(inbody.router)
app.include_router(nutrition.router)
app.include_router(english.router)


@app.middleware("http")
async def verify_jwt(request: Request, call_next):
    dev_mode = os.environ.get("DEV_MODE", "false").lower() == "true"
    allowed_email = os.environ.get("ALLOWED_EMAIL", "")

    # Skip auth for health endpoint
    if request.url.path == "/health" or request.url.path.startswith("/api/auth"):
        return await call_next(request)

    # DEV_MODE bypasses auth (development only)
    if dev_mode:
        return await call_next(request)

    # ALLOWED_EMAIL not set = server misconfiguration in production
    if not allowed_email:
        return JSONResponse(
            status_code=503,
            content={"detail": "Server misconfigured: ALLOWED_EMAIL not set"},
        )

    # Verify Google ID token from Authorization header
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Missing or invalid Authorization header"},
        )

    id_token_str = auth_header[len("Bearer "):]

    try:
        client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
        if not client_id:
            logger.warning("GOOGLE_CLIENT_ID not set, skipping audience verification")
            return JSONResponse(
                status_code=503,
                content={"detail": "Server misconfigured: GOOGLE_CLIENT_ID not set"},
            )
        id_info = google_id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            audience=client_id,
        )
        if id_info.get("email") != allowed_email:
            return JSONResponse(status_code=401, content={"detail": "Unauthorized email"})
    except Exception as e:
        logger.warning("JWT verification failed: %s", str(e))
        return JSONResponse(status_code=401, content={"detail": "Invalid or expired token"})

    return await call_next(request)


@app.get("/health")
def health():
    return {"status": "ok"}
