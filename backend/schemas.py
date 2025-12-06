# schemas.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MemberBase(BaseModel):
    name: str = Field(..., example="Alice")
    email: Optional[str] = Field(None, example="alice@example.com")
    phone: Optional[str] = Field(None, example="+254712345678")

class MemberCreate(MemberBase):
    pass

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class MemberOut(MemberBase):
    id: int
    class Config:
        orm_mode = True


class BookBase(BaseModel):
    title: str = Field(..., example="The Hobbit")
    author: Optional[str] = Field(None, example="J. R. R. Tolkien")
    published_year: Optional[int] = Field(None, example=1937)
    cover_id: Optional[int] = Field(None, example=82345)
    copies: Optional[int] = Field(1, ge=0, example=1)

class BookCreate(BookBase):
    likes: Optional[int] = 0
    rating: Optional[float] = 0.0
    rating_count: Optional[int] = 0
    is_favorite: Optional[bool] = False

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    published_year: Optional[int] = None
    cover_id: Optional[int] = None
    copies: Optional[int] = Field(None, ge=0)
    is_favorite: Optional[bool] = None

class BookOut(BookBase):
    id: int
    likes: int
    rating: float
    rating_count: int
    is_favorite: bool
    class Config:
        orm_mode = True


class BorrowBase(BaseModel):
    member_id: int
    book_id: int

class BorrowCreate(BorrowBase):
    pass

class BorrowReturn(BaseModel):
    return_date: Optional[datetime] = None

class BorrowOut(BaseModel):
    id: int
    member_id: int
    book_id: int
    borrow_date: datetime
    return_date: Optional[datetime] = None
    class Config:
        orm_mode = True
