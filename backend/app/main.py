# app/main.py - CORRECTED VERSION
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import books, members, borrow, dashboard

# Import the Base from database, not redeclare it
from app.database import Base, engine

# Import models to ensure they're registered
from app import models

app = FastAPI(
    title="Library Management System API",
    description="API for managing books, members, and borrowing records",
    version="1.0.0"
)

# ========== CORS CONFIGURATION ==========
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# ========== CREATE TABLES ==========
# This should be here, not in models
Base.metadata.create_all(bind=engine)

# ========== INCLUDE ROUTERS ==========
app.include_router(books.router)
app.include_router(members.router)
app.include_router(borrow.router)
app.include_router(dashboard.router)

# ========== BASIC ROUTES ==========
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Library Management System API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/test")
def test_endpoint():
    return {"message": "API test endpoint is working!"}