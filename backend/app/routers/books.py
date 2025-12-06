from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.crud import get_books, create_book
from backend.app.schemas import BookCreate, BookOut

router = APIRouter(prefix="/books", tags=["books"])

@router.get("/", response_model=List[BookOut])
def read_books(db: Session = Depends(get_db)):
    return get_books(db)

@router.post("/", response_model=BookOut)
def add_book(book: BookCreate, db: Session = Depends(get_db)):
    return create_book(db, book)
