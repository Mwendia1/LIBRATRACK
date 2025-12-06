from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import books, members, borrow, dashboard
from app.database import Base, engine
from app import models

app = FastAPI(
    title="Library Management System API",
    description="API for managing books, members, and borrowing records",
    version="1.0.0"
)

# ========== CORS CONFIGURATION ==========
# Allow your Vercel frontend and local development
origins = [
    "https://libratrack-teal.vercel.app",  # Your Vercel URL
    "http://localhost:5173",
    "http://localhost:3000",
    "https://libratrack-kotz.onrender.com",  # Your backend URL (for testing)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# ========== CREATE TABLES ==========
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
    return {"status": "healthy", "database": "connected"}

@app.get("/api/test")
def test_endpoint():
    return {"message": "API test endpoint is working!"}