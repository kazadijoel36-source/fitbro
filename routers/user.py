from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_conn

router = APIRouter(tags=["User Vitals"])

class OnboardData(BaseModel):
    weight: float
    target: float
    height: int
    lactose: bool
    pushups: int
    pullups: int

@router.get("/health-check")
def system_diagnostic():
    """VANGUARD_DIAGNOSTIC_PROTOCOL"""
    conn = None
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        return {"status": "ONLINE", "database": "CONNECTED", "location": "POTCHEFSTROOM_CORE"}
    except Exception as e:
        return {"status": "OFFLINE", "database": "DISCONNECTED", "error": str(e)}
    finally:
        if conn: conn.close()

@router.get("/vitals/{user_id}")
def fetch_operative_vitals(user_id: int):
    conn = get_db_conn()
    from psycopg2.extras import RealDictCursor
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # UPDATED: Uses 'operatives' table instead of 'user_profiles'
        # UPDATED: Uses 'id' instead of 'user_id' to match fitbro.py
        query = """
            SELECT p.*, 
                   m.hydration_target, m.kinetic_target, m.nutrition_target
            FROM operatives p
            LEFT JOIN daily_missions m ON p.id = m.user_id AND m.mission_date = CURRENT_DATE
            WHERE p.id = %s
        """
        cur.execute(query, (user_id,))
        result = cur.fetchone()
        if not result: raise HTTPException(status_code=404, detail="OPERATIVE_NOT_FOUND")
        return result
    finally: conn.close()

@router.post("/initialize-vanguard/{user_id}")
def initialize_vanguard(user_id: int, data: OnboardData):
    conn = get_db_conn()
    try:
        cur = conn.cursor()
        # UPDATED: Table name and column names to match the operatives schema
        cur.execute("""
            UPDATE operatives SET 
            current_mass=%s, target_mass=%s, height=%s, 
            lactose_intolerant=%s, pushup_max=%s, pullup_max=%s, 
            total_xp=100 
            WHERE id=%s
        """, (data.weight, data.target, data.height, data.lactose, data.pushups, data.pullups, user_id))
        conn.commit()
        return {"status": "INITIALIZED"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally: conn.close()