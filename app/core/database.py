"""Database connection and session management"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from app.core.config import settings
from app.models import Base


# Create engine
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite configuration (for testing)
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Enable foreign keys for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    # PostgreSQL configuration
    engine = create_engine(
        settings.DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
    )


# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def drop_db():
    """Drop all database tables"""
    Base.metadata.drop_all(bind=engine)
