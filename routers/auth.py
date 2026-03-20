from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os

# PATH REPAIR: Allows this sub-folder file to see the main folder
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_link

router = APIRouter(tags=["Auth"])

from typing import Optional

class UserAuth(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None # Added for personalization

@router.post("/signup")
def signup(data: UserAuth):
    conn = get_db_link()
    try:
        cur = conn.cursor()
        # Inserting full_name into the database
        cur.execute("""
            INSERT INTO user_profiles (email, password_hash, full_name, xp, current_level) 
            VALUES (%s, %s, %s, 0, 1) RETURNING user_id
        """, (data.email, data.password, data.full_name))
        
        uid = cur.fetchone()[0]
        conn.commit()
        return {"user_id": uid}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Enlistment Failed: {str(e)}")
    finally: 
        conn.close()
@router.post("/login")
def login(data: UserAuth):
    conn = get_db_link()
    from psycopg2.extras import RealDictCursor
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT user_id FROM user_profiles WHERE email = %s AND password_hash = %s", (data.email, data.password))
    user = cur.fetchone()
    conn.close()
    if not user: raise HTTPException(status_code=401)
    return user