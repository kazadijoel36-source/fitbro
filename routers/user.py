from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os

# PATH REPAIR: Access database.py in the parent folder
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_link

router = APIRouter(tags=["User Vitals"])

# --- SCHEMAS ---
class OnboardData(BaseModel):
    weight: float
    target: float
    height: int
    lactose: bool
    pushups: int
    pullups: int

# --- DIAGNOSTICS ---
@router.get("/weekly-stats/{user_id}")
def get_weekly_intelligence(user_id: int):
    conn = get_db_link()
    from psycopg2.extras import RealDictCursor
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # Pulls sum of calories and average steps for the last 7 days
        query = """
            SELECT 
                SUM(calories) as total_kcal,
                COUNT(log_id) as meal_count,
                (SELECT AVG(daily_steps) FROM user_profiles WHERE user_id = %s) as avg_steps
            FROM nutrition_logs 
            WHERE user_id = %s AND log_date > CURRENT_DATE - INTERVAL '7 days'
        """
        cur.execute(query, (user_id, user_id))
        return cur.fetchone()
    finally:
        conn.close()
@router.get("/health-check")
def system_diagnostic():
    """Verifies the Neural Link to the Postgres Database."""
    conn = None
    try:
        conn = get_db_link()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        return {
            "status": "ONLINE",
            "database": "CONNECTED",
            "latency": "OPTIMAL",
            "location": "POTCHEFSTROOM_CORE"
        }
    except Exception as e:
        return {
            "status": "OFFLINE",
            "database": "DISCONNECTED",
            "error_log": str(e)
        }
    finally:
        if conn:
            conn.close()
            

# --- CORE USER OPERATIONS ---

@router.get("/vitals/{user_id}")
def fetch_operative_vitals(user_id: int):
    """Pulls full dossier including Full Name and Mission Status."""
    conn = get_db_link()
    from psycopg2.extras import RealDictCursor
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # Fetch Profile (including full_name), Missions, and Medal Count
        query = """
            SELECT p.*, m.hydration_target, m.kinetic_target, m.nutrition_target,
            (SELECT COUNT(*) FROM user_medals WHERE user_id = p.user_id) as medal_count
            FROM user_profiles p
            LEFT JOIN daily_missions m ON p.user_id = m.user_id AND m.mission_date = CURRENT_DATE
            WHERE p.user_id = %s
        """
        cur.execute(query, (user_id,))
        result = cur.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Operative not found in database.")
        return result
    finally: 
        conn.close()

@router.post("/initialize-vanguard/{user_id}")
def initialize_vanguard(user_id: int, data: OnboardData):
    """Syncs baseline biometrics from the Onboarding phase."""
    conn = get_db_link()
    try:
        cur = conn.cursor()
        cur.execute("""
            UPDATE user_profiles SET 
            current_weight=%s, target_weight=%s, height_cm=%s, 
            lactose_intolerant=%s, max_pushups=%s, max_pullups=%s, 
            xp=100 
            WHERE user_id=%s
        """, (data.weight, data.target, data.height, data.lactose, data.pushups, data.pullups, user_id))
        conn.commit()
        return {"status": "INITIALIZED"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.post("/add-water/{user_id}")
def log_hydration(user_id: int):
    """Increments hydration and checks for Daily Mission completion."""
    conn = get_db_link()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE user_profiles SET current_water_ml = current_water_ml + 250 WHERE user_id = %s RETURNING current_water_ml", (user_id,))
        total = cur.fetchone()[0]
        # Mark mission complete if target (3000ml) met
        if total >= 3000:
            cur.execute("""
                INSERT INTO daily_missions (user_id, hydration_target) VALUES (%s, TRUE) 
                ON CONFLICT (user_id, mission_date) DO UPDATE SET hydration_target = TRUE
            """, (user_id,))
        conn.commit()
        return {"status": "HYDRATED", "total": total}
    finally: 
        conn.close()