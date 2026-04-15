from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 – ensures all models are registered
from routes import router
from seed import seed_data

app = FastAPI(
    title="Smart Billing API",
    description="Fast billing system for mobile retailers",
    version="1.0.0"
)

# CORS – allow React dev server and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://billingdemo.vercel.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables on startup
Base.metadata.create_all(bind=engine)

# Seed demo data (idempotent)
@app.on_event("startup")
async def startup_event():
    seed_data()


app.include_router(router)


@app.get("/")
async def root():
    return {"message": "Smart Billing API is running 🚀"}