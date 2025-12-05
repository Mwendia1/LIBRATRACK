# schemas.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# ---------- Member schemas ----------
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

# ---------- Book schemas ----------
class BookBase(BaseModel):
    title: str = Field(..., example="The Hobbit")
    author: Optional[str] = Field(None, example="J. R. R. Tolkien")
    copies: Optional[int] = Field(1, ge=0, example=1)

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    copies: Optional[int] = Field(None, ge=0)

class BookOut(BookBase):
    id: int

    class Config:
        orm_mode = True

# ---------- Borrow schemas ----------
class BorrowBase(BaseModel):
    member_id: int
    book_id: int

class BorrowCreate(BorrowBase):
    pass

class BorrowReturn(BaseModel):
    # optional explicit return_date if you want to pass one
    return_date: Optional[datetime] = None

class BorrowOut(BaseModel):
    id: int
    member_id: int
    book_id: int
    borrow_date: datetime
    return_date: Optional[datetime] = None

    class Config:
        orm_mode = True
