from sqlalchemy.orm import Session
from models import Member, Book
from schemas import MemberCreate, BookCreate

# Members
def get_members(db: Session):
    return db.query(Member).all()

def create_member(db: Session, member: MemberCreate):
    db_member = Member(name=member.name)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

# Books
def get_books(db: Session):
    return db.query(Book).all()

def create_book(db: Session, book: BookCreate):
    db_book = Book(title=book.title, author=book.author)
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book
