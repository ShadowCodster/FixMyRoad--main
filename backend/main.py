from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import BASE_DIR
from app.routers import analyze, auth, authorities, complaints, contractors, dashboard, roads

app = FastAPI(title="RoadWatch API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(BASE_DIR / "uploads")), name="uploads")

app.include_router(auth.router)
app.include_router(roads.router)
app.include_router(complaints.router)
app.include_router(authorities.router)
app.include_router(contractors.router)
app.include_router(dashboard.router)
app.include_router(analyze.router)


@app.get("/")
def view_root():
    return {"message": "RoadWatch API"}
