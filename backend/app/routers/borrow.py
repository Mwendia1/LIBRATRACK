from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(prefix="/api/borrow", tags=["borrow"])

@router.get("/", response_model=List[schemas.BorrowResponse])
def read_borrows(
    returned: bool = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    return crud.get_borrows(db, skip=skip, limit=limit, returned=returned)

@router.post("/", response_model=schemas.BorrowResponse)
def create_borrow(borrow: schemas.BorrowCreate, db: Session = Depends(database.get_db)):
    db_borrow = crud.create_borrow(db=db, borrow=borrow)
    if db_borrow is None:
        raise HTTPException(
            status_code=400,
            detail="Book not available or not found"
        )
    return db_borrow

@router.patch("/{borrow_id}/return", response_model=schemas.BorrowResponse)
def return_borrow(borrow_id: int, db: Session = Depends(database.get_db)):
    db_borrow = crud.return_book(db, borrow_id=borrow_id)
    if db_borrow is None:
        raise HTTPException(status_code=404, detail="Borrow record not found or already returned")
    return db_borrow