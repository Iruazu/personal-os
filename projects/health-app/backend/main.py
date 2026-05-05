from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import workout, inbody, nutrition, english

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Health Tracking API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workout.router)
app.include_router(inbody.router)
app.include_router(nutrition.router)
app.include_router(english.router)


@app.get("/health")
def health():
    return {"status": "ok"}
