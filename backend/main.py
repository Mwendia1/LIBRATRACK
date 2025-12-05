# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from database import Base, engine, get_db
from models import Book, Member, Borrow
from schemas import (
    BookCreate, BookOut, BookUpdate,
    MemberCreate, MemberOut, MemberUpdate,
    BorrowCreate, BorrowOut, BorrowReturn,
)

from datetime import datetime

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LibraTrack API")

# Allow local frontend during development (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to ["http://localhost:5173"] for Vite production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# Health check
# ------------------------
@app.get("/health")
def health():
    return {"status": "ok"}

# ------------------------
# BOOK endpoints
# ------------------------
@app.get("/books", response_model=List[BookOut])
def read_books(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    books = db.query(Book).offset(skip).limit(limit).all()
    return books

@app.get("/books/{book_id}", response_model=BookOut)
def read_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@app.post("/books", response_model=BookOut, status_code=status.HTTP_201_CREATED)
def create_book(book_in: BookCreate, db: Session = Depends(get_db)):
    new_book = Book(**book_in.dict())
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book

@app.put("/books/{book_id}", response_model=BookOut)
def update_book(book_id: int, book_in: BookUpdate, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book_in.title is not None:
        book.title = book_in.title
    if book_in.author is not None:
        book.author = book_in.author
    if book_in.copies is not None:
        # do not allow negative copies
        if book_in.copies < 0:
            raise HTTPException(status_code=400, detail="copies cannot be negative")
        book.copies = book_in.copies
    db.commit()
    db.refresh(book)
    return book

@app.delete("/books/{book_id}", status_code=status.HTTP_200_OK)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": f"Book {book_id} deleted"}

# ------------------------
# MEMBER endpoints
# ------------------------
@app.get("/members", response_model=List[MemberOut])
def read_members(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    members = db.query(Member).offset(skip).limit(limit).all()
    return members

@app.get("/members/{member_id}", response_model=MemberOut)
def read_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@app.post("/members", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def create_member(member_in: MemberCreate, db: Session = Depends(get_db)):
    # optional: check for duplicate email
    if member_in.email:
        exists = db.query(Member).filter(Member.email == member_in.email).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email already registered")
    new_member = Member(**member_in.dict())
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member

@app.put("/members/{member_id}", response_model=MemberOut)
def update_member(member_id: int, member_in: MemberUpdate, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if member_in.name is not None:
        member.name = member_in.name
    if member_in.email is not None:
        member.email = member_in.email
    if member_in.phone is not None:
        member.phone = member_in.phone
    db.commit()
    db.refresh(member)
    return member

@app.delete("/members/{member_id}", status_code=status.HTTP_200_OK)
def delete_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"message": f"Member {member_id} deleted"}

# ------------------------
# BORROW / RETURN endpoints
# ------------------------
@app.post("/borrow", response_model=BorrowOut, status_code=status.HTTP_201_CREATED)
def borrow_book(borrow_in: BorrowCreate, db: Session = Depends(get_db)):
    # check member
    member = db.query(Member).filter(Member.id == borrow_in.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    # check book
    book = db.query(Book).filter(Book.id == borrow_in.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # check availability (copies > 0)
    if book.copies <= 0:
        raise HTTPException(status_code=400, detail="No copies available to borrow")

    # create borrow record
    borrow = Borrow(member_id=member.id, book_id=book.id, borrow_date=datetime.utcnow())
    db.add(borrow)

    # decrement available copies
    book.copies = book.copies - 1
    db.commit()
    db.refresh(borrow)
    return borrow

@app.post("/return/{borrow_id}", response_model=BorrowOut)
def return_book(borrow_id: int, payload: BorrowReturn = None, db: Session = Depends(get_db)):
    borrow = db.query(Borrow).filter(Borrow.id == borrow_id).first()
    if not borrow:
        raise HTTPException(status_code=404, detail="Borrow record not found")

    if borrow.return_date is not None:
        raise HTTPException(status_code=400, detail="Book already returned")

    # set return date (use payload.return_date if provided else now)
    return_dt = payload.return_date if payload and payload.return_date else datetime.utcnow()
    borrow.return_date = return_dt

    # increment book copies back
    book = db.query(Book).filter(Book.id == borrow.book_id).first()
    if book:
        book.copies = (book.copies or 0) + 1

    db.commit()
    db.refresh(borrow)
    return borrow

@app.get("/borrows", response_model=List[BorrowOut])
def list_borrows(show_all: bool = True, db: Session = Depends(get_db)):
    """
    If show_all is True returns all borrows (returned and not returned).
    To list only active borrows, call with ?show_all=false
    """
    if show_all:
        borrows = db.query(Borrow).all()
    else:
        borrows = db.query(Borrow).filter(Borrow.return_date == None).all()
    return borrows

@app.get("/members/{member_id}/borrows", response_model=List[BorrowOut])
def borrows_for_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    borrows = db.query(Borrow).filter(Borrow.member_id == member_id).all()
    return borrows
