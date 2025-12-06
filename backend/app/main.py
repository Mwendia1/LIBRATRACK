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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


Base.metadata.create_all(bind=engine)


app.include_router(books.router)
app.include_router(members.router)
app.include_router(borrow.router)
app.include_router(dashboard.router)


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