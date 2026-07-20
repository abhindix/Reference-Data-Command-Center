"""FastAPI application entry point"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import health, reference_data, loans, admin, applications
from app.core.config import settings
from app.core.database import init_db

# Event handlers
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"Starting Loan Reference Data Platform v{settings.APP_VERSION}")
    print(f"Test Mode: {settings.TEST_MODE}")
    
    # Initialize database
    try:
        init_db()
        print("[OK] Database initialized")
    except Exception as e:
        print(f"[ERROR] Database initialization error: {e}")

    # Seed mock applications
    try:
        from app.core.database import SessionLocal
        from app.services.database_service import DatabaseService
        with SessionLocal() as db:
            seeded = DatabaseService.seed_mock_applications(db)
            if seeded:
                print(f"[OK] Seeded {seeded} mock applications")
    except Exception as e:
        print(f"[WARN] Could not seed applications: {e}")
    
    yield
    
    # Shutdown
    print("Shutting down application")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Reference data management service for loan processing systems",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(reference_data.router, prefix="/api/v1", tags=["reference_data"])
app.include_router(loans.router, prefix="/api/v1", tags=["loans"])
app.include_router(applications.router, prefix="/api/v1", tags=["applications"])
app.include_router(admin.router, prefix="/api/v1", tags=["admin"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Loan Reference Data Platform",
        "version": settings.APP_VERSION,
        "status": "running",
        "test_mode": settings.TEST_MODE
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
