from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import close_mongo_connection, connect_to_mongo
from app.routes.analysis import router as analysis_router
from app.routes.encyclopedia import router as encyclopedia_router
from app.routes.health import router as health_router
from app.routes.qa import router as qa_router
from app.routes.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


settings = get_settings()

app = FastAPI(
    title="Plant Lifecycle Multi-Agent Predictor API",
    description="FastAPI backend for image-based plant diagnosis and lifecycle prediction.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(qa_router)
app.include_router(encyclopedia_router)

