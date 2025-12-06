
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from database import Base, engine, get_db
from models import Book, Member, Borrow
from schemas import (
    BookCreate, BookOut, BookUpdate,
    MemberCreate, MemberOut, MemberUpdate,
    BorrowCreate, BorrowOut, BorrowReturn,
)

from datetime import datetime

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LibraTrack API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/books", response_model=List[BookOut])
def read_books(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return db.query(Book).offset(skip).limit(limit).all()

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
    update_data = book_in.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(book, k, v)
    db.commit()
    db.refresh(book)
    return book

@app.delete("/books/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": f"Book {book_id} deleted"}

@app.patch("/books/{book_id}/like")
def like_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    book.likes = (book.likes or 0) + 1
    db.commit()
    return {"likes": book.likes}


@app.patch("/books/{book_id}/rate/{value}")
def rate_book(book_id: int, value: int, db: Session = Depends(get_db)):
    if value < 1 or value > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    current_total = (book.rating or 0.0) * (book.rating_count or 0)
    new_count = (book.rating_count or 0) + 1
    new_total = current_total + value
    book.rating = new_total / new_count
    book.rating_count = new_count
    db.commit()
    return {"rating": book.rating, "rating_count": book.rating_count}

# Toggle favorite
@app.patch("/books/{book_id}/favorite")
def toggle_favorite(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    book.is_favorite = not bool(book.is_favorite)
    db.commit()
    return {"is_favorite": book.is_favorite}


@app.get("/suggestions", response_model=List[BookOut])
def suggestions(limit: int = 5, db: Session = Depends(get_db)):

    by_likes = db.query(Book).order_by(Book.likes.desc()).limit(limit).all()
    if by_likes:
        return by_likes
    return db.query(Book).order_by(Book.rating.desc()).limit(limit).all()


@app.get("/members", response_model=List[MemberOut])
def read_members(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return db.query(Member).offset(skip).limit(limit).all()

@app.get("/members/{member_id}", response_model=MemberOut)
def read_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@app.post("/members", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def create_member(member_in: MemberCreate, db: Session = Depends(get_db)):
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
    update_data = member_in.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(member, k, v)
    db.commit()
    db.refresh(member)
    return member

@app.delete("/members/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(member)
    db.commit()
    return {"message": f"Member {member_id} deleted"}


@app.post("/borrow", response_model=BorrowOut, status_code=status.HTTP_201_CREATED)
def borrow_book(borrow_in: BorrowCreate, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == borrow_in.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    book = db.query(Book).filter(Book.id == borrow_in.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if (book.copies or 0) <= 0:
        raise HTTPException(status_code=400, detail="No copies available")
    borrow = Borrow(member_id=member.id, book_id=book.id, borrow_date=datetime.utcnow())
    db.add(borrow)
    book.copies = (book.copies or 0) - 1
    db.commit()
    db.refresh(borrow)
    return borrow

@app.post("/return/{borrow_id}", response_model=BorrowOut)
def return_book(borrow_id: int, payload: Optional[BorrowReturn] = None, db: Session = Depends(get_db)):
    borrow = db.query(Borrow).filter(Borrow.id == borrow_id).first()
    if not borrow:
        raise HTTPException(status_code=404, detail="Borrow record not found")
    if borrow.return_date is not None:
        raise HTTPException(status_code=400, detail="Already returned")
    return_dt = payload.return_date if payload and payload.return_date else datetime.utcnow()
    borrow.return_date = return_dt
    book = db.query(Book).filter(Book.id == borrow.book_id).first()
    if book:
        book.copies = (book.copies or 0) + 1
    db.commit()
    db.refresh(borrow)
    return borrow

@app.get("/borrows", response_model=List[BorrowOut])
def list_borrows(active_only: bool = False, db: Session = Depends(get_db)):
    if active_only:
        return db.query(Borrow).filter(Borrow.return_date == None).all()
    return db.query(Borrow).all()

@app.get("/members/{member_id}/borrows", response_model=List[BorrowOut])
def borrows_for_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return db.query(Borrow).filter(Borrow.member_id == member_id).all()
