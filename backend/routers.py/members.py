from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from crud import get_members, create_member
from schemas import MemberCreate, MemberOut

router = APIRouter(prefix="/members", tags=["members"])

@router.get("/", response_model=List[MemberOut])
def read_members(db: Session = Depends(get_db)):
    return get_members(db)

@router.post("/", response_model=MemberOut)
def add_member(member: MemberCreate, db: Session = Depends(get_db)):
    return create_member(db, member)
