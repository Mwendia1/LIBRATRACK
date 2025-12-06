from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

# ========== DATABASE SETUP ==========
SQLALCHEMY_DATABASE_URL = "sqlite:///./libratrack.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ========== DATABASE MODELS ==========
class Book(Base):
    __tablename__ = "books"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    published_year = Column(Integer, nullable=True)
    isbn = Column(String, nullable=True)
    copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)
    likes = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    is_favorite = Column(Boolean, default=False)
    cover_id = Column(String, nullable=True)
    
    borrows = relationship("Borrow", back_populates="book")

class Member(Base):
    __tablename__ = "members"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    join_date = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    borrows = relationship("Borrow", back_populates="member")

class Borrow(Base):
    __tablename__ = "borrows"
    
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"))
    member_id = Column(Integer, ForeignKey("members.id"))
    borrow_date = Column(DateTime, default=datetime.utcnow)
    return_date = Column(DateTime, nullable=True)
    due_date = Column(DateTime, default=lambda: datetime.utcnow().replace(day=datetime.utcnow().day + 14))
    returned = Column(Boolean, default=False)
    
    book = relationship("Book", back_populates="borrows")
    member = relationship("Member", back_populates="borrows")

# Create tables
Base.metadata.create_all(bind=engine)

# ========== PYDANTIC SCHEMAS ==========
class BookBase(BaseModel):
    title: str
    author: str
    published_year: Optional[int] = None
    isbn: Optional[str] = None
    copies: int = 1
    cover_id: Optional[str] = None

class BookCreate(BookBase):
    pass

class Book(BookBase):
    id: int
    available_copies: int
    likes: int
    rating: float
    rating_count: int
    is_favorite: bool
    
    class Config:
        from_attributes = True

class MemberBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class MemberCreate(MemberBase):
    pass

class Member(MemberBase):
    id: int
    join_date: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class BorrowBase(BaseModel):
    book_id: int
    member_id: int

class BorrowCreate(BorrowBase):
    pass

class Borrow(BorrowBase):
    id: int
    borrow_date: datetime
    return_date: Optional[datetime]
    due_date: datetime
    returned: bool
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_books: int
    total_members: int
    active_borrows: int
    overdue_borrows: int
    available_books: int

# ========== FASTAPI APP ==========
app = FastAPI(
    title="Library Management System API",
    description="API for managing books, members, and borrowing records",
    version="1.0.0"
)

# ========== CORS CONFIGURATION ==========
# Configure CORS properly
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",  # Allow all for development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ========== OPTIONS HANDLER FOR CORS PREFLIGHT ==========
@app.options("/{path:path}")
async def options_handler(path: str):
    return JSONResponse(
        content={"message": "CORS preflight"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
        }
    )

# ========== HELPER FUNCTIONS ==========
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ========== ROUTES ==========
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

# ========== BOOKS ROUTES ==========
@app.get("/api/books", response_model=list[Book])
def get_books():
    db = SessionLocal()
    try:
        books = db.query(Book).all()
        return books
    finally:
        db.close()

@app.post("/api/books", response_model=Book)
def create_book(book: BookCreate):
    db = SessionLocal()
    try:
        db_book = Book(
            **book.dict(),
            available_copies=book.copies
        )
        db.add(db_book)
        db.commit()
        db.refresh(db_book)
        return db_book
    finally:
        db.close()

# ========== MEMBERS ROUTES ==========
@app.get("/api/members", response_model=list[Member])
def get_members():
    db = SessionLocal()
    try:
        members = db.query(Member).all()
        return members
    finally:
        db.close()

@app.post("/api/members", response_model=Member)
def create_member(member: MemberCreate):
    db = SessionLocal()
    try:
        db_member = Member(**member.dict())
        db.add(db_member)
        db.commit()
        db.refresh(db_member)
        return db_member
    finally:
        db.close()

# ========== BORROW ROUTES ==========
@app.get("/api/borrow", response_model=list[Borrow])
def get_borrows(returned: bool = False, limit: int = 5):
    db = SessionLocal()
    try:
        borrows = db.query(Borrow).filter(Borrow.returned == returned).limit(limit).all()
        return borrows
    finally:
        db.close()

@app.post("/api/borrow", response_model=Borrow)
def create_borrow(borrow: BorrowCreate):
    db = SessionLocal()
    try:
        # Check if book is available
        book = db.query(Book).filter(Book.id == borrow.book_id).first()
        if not book or book.available_copies < 1:
            return {"error": "Book not available"}
        
        # Create borrow record
        db_borrow = Borrow(**borrow.dict())
        db.add(db_borrow)
        
        # Update available copies
        book.available_copies -= 1
        db.commit()
        db.refresh(db_borrow)
        return db_borrow
    finally:
        db.close()

# ========== DASHBOARD ROUTES ==========
@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats():
    db = SessionLocal()
    try:
        total_books = db.query(Book).count()
        total_members = db.query(Member).count()
        active_borrows = db.query(Borrow).filter(Borrow.returned == False).count()
        overdue_borrows = active_borrows // 2  # Simplified for demo
        available_books = db.query(Book).filter(Book.available_copies > 0).count()
        
        return DashboardStats(
            total_books=total_books,
            total_members=total_members,
            active_borrows=active_borrows,
            overdue_borrows=overdue_borrows,
            available_books=available_books
        )
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)