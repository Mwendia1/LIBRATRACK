from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from typing import List, Optional
from . import models, schemas

# Book CRUD operations
def get_books(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = db.query(models.Book)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Book.title.ilike(search_term)) | 
            (models.Book.author.ilike(search_term))
        )
    return query.offset(skip).limit(limit).all()

def get_book(db: Session, book_id: int):
    return db.query(models.Book).filter(models.Book.id == book_id).first()

def create_book(db: Session, book: schemas.BookCreate):
    db_book = models.Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

def update_book(db: Session, book_id: int, book_update: schemas.BookUpdate):
    db_book = get_book(db, book_id)
    if not db_book:
        return None
    
    update_data = book_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_book, field, value)
    
    db.commit()
    db.refresh(db_book)
    return db_book

def like_book(db: Session, book_id: int):
    db_book = get_book(db, book_id)
    if not db_book:
        return None
    db_book.likes = (db_book.likes or 0) + 1
    db.commit()
    db.refresh(db_book)
    return db_book

def rate_book(db: Session, book_id: int, rating: float):
    db_book = get_book(db, book_id)
    if not db_book:
        return None
    
    current_rating = db_book.rating or 0
    current_count = db_book.rating_count or 0
    
    if current_count == 0:
        new_rating = rating
    else:
        new_rating = ((current_rating * current_count) + rating) / (current_count + 1)
    
    db_book.rating = round(new_rating, 1)
    db_book.rating_count = current_count + 1
    db.commit()
    db.refresh(db_book)
    return db_book

def toggle_favorite(db: Session, book_id: int):
    db_book = get_book(db, book_id)
    if not db_book:
        return None
    db_book.is_favorite = not db_book.is_favorite
    db.commit()
    db.refresh(db_book)
    return db_book

# Member CRUD operations
def get_members(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = db.query(models.Member)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.Member.name.ilike(search_term)) | 
            (models.Member.email.ilike(search_term))
        )
    return query.offset(skip).limit(limit).all()

def get_member(db: Session, member_id: int):
    return db.query(models.Member).filter(models.Member.id == member_id).first()

def create_member(db: Session, member: schemas.MemberCreate):
    member_data = member.dict()
    if member_data.get('email') == "":
        member_data['email'] = None
    
    db_member = models.Member(**member_data)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

def update_member(db: Session, member_id: int, member_update: schemas.MemberUpdate):
    db_member = get_member(db, member_id)
    if not db_member:
        return None
    
    update_data = member_update.dict(exclude_unset=True)
    if 'email' in update_data and update_data['email'] == "":
        update_data['email'] = None
    
    for field, value in update_data.items():
        setattr(db_member, field, value)
    
    db.commit()
    db.refresh(db_member)
    return db_member

# Borrow CRUD operations
def get_borrows(db: Session, skip: int = 0, limit: int = 100, returned: bool = None):
    query = db.query(models.Borrow)
    if returned is not None:
        query = query.filter(models.Borrow.returned == returned)
    query = query.order_by(models.Borrow.borrow_date.desc())
    return query.offset(skip).limit(limit).all()

def create_borrow(db: Session, borrow: schemas.BorrowCreate):
    book = db.query(models.Book).filter(models.Book.id == borrow.book_id).first()
    member = db.query(models.Member).filter(models.Member.id == borrow.member_id).first()
    
    if not book or not member:
        return None
    
    if book.available_copies < 1:
        return None
    
    book.available_copies -= 1
    
    db_borrow = models.Borrow(
        book_id=borrow.book_id,
        member_id=borrow.member_id,
        borrow_date=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=14)
    )
    
    db.add(db_borrow)
    db.commit()
    db.refresh(db_borrow)
    return db_borrow

def return_book(db: Session, borrow_id: int):
    db_borrow = db.query(models.Borrow).filter(models.Borrow.id == borrow_id).first()
    if not db_borrow or db_borrow.returned:
        return None
    
    db_borrow.returned = True
    db_borrow.return_date = datetime.utcnow()
    
    book = db.query(models.Book).filter(models.Book.id == db_borrow.book_id).first()
    if book:
        book.available_copies += 1
    
    db.commit()
    db.refresh(db_borrow)
    return db_borrow

# Dashboard operations
def get_dashboard_stats(db: Session):
    total_books = db.query(models.Book).count()
    total_members = db.query(models.Member).count()
    
    active_borrows = db.query(models.Borrow).filter(models.Borrow.returned == False).count()
    
    overdue_borrows = db.query(models.Borrow).filter(
        models.Borrow.returned == False,
        models.Borrow.due_date < datetime.utcnow()
    ).count()
    
    available_books = db.query(models.Book).filter(models.Book.available_copies > 0).count()
    
    return {
        "total_books": total_books,
        "total_members": total_members,
        "active_borrows": active_borrows,
        "overdue_borrows": overdue_borrows,
        "available_books": available_books
    }