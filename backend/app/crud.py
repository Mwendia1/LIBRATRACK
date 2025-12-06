from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from . import models, schemas
from datetime import datetime, timedelta
from typing import List, Optional

# Book CRUD operations (keep existing book functions)
# ... [previous book functions remain the same] ...

# Member CRUD operations
def get_members(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = db.query(models.Member)
    if search:
        query = query.filter(models.Member.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

def get_member(db: Session, member_id: int):
    return db.query(models.Member).filter(models.Member.id == member_id).first()

def create_member(db: Session, member: schemas.MemberCreate):
    # Handle empty email string
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
    # Handle empty email string
    if 'email' in update_data and update_data['email'] == "":
        update_data['email'] = None
    
    for field, value in update_data.items():
        setattr(db_member, field, value)
    
    db.commit()
    db.refresh(db_member)
    return db_member

# Keep other functions the same
# ... [rest of the file remains unchanged] ...