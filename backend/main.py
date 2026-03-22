from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import logging

from config.database import db
from config.settings import settings
from middleware.error_handler import error_handler_middleware, validation_exception_handler

# Import routers
from routes import auth, products

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events"""
    # Startup
    await db.connect_db()
    logger.info("✅ Application started")
    yield
    # Shutdown
    await db.close_db()
    logger.info("❌ Application shutdown")

# Create FastAPI app
app = FastAPI(
    title="Slow Fashion Society API",
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.middleware("http")(error_handler_middleware)

# Add exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Include routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")

# TODO: Add remaining routers (cart, orders, payments, reviews, etc.)

@app.get("/")
async def root():
    return {"message": "Slow Fashion Society API v2.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
