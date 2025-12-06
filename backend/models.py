# models.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Member(Base):
    __tablename__ = "members"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, nullable=True)
    borrows = relationship("Borrow", back_populates="member", cascade="all, delete-orphan")

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    author = Column(String, nullable=True)
    published_year = Column(Integer, nullable=True)
    cover_id = Column(Integer, nullable=True)
    copies = Column(Integer, default=1)        
    likes = Column(Integer, default=0)
    rating = Column(Float, default=0.0)        
    rating_count = Column(Integer, default=0)  
    is_favorite = Column(Boolean, default=False)

    borrows = relationship("Borrow", back_populates="book", cascade="all, delete-orphan")

class Borrow(Base):
    __tablename__ = "borrows"
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    borrow_date = Column(DateTime, default=datetime.utcnow)
    return_date = Column(DateTime, nullable=True)

    member = relationship("Member", back_populates="borrows")
    book = relationship("Book", back_populates="borrows")
