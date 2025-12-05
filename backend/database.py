# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite URL (file-based)
SQLALCHEMY_DATABASE_URL = "sqlite:///./libratrack.db"

# connect_args required for SQLite in same thread
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency for FastAPI endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
