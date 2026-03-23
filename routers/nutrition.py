from fastapi import APIRouter, Query, HTTPException
from groq import Groq
import json
import os
import sys

# Standardized path repair
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_conn

router = APIRouter(tags=["Nutrition Vault"])
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@router.post("/ai-log")
def analyze_and_log_fuel(user_id: int, food_input: str = Query(...)):
    prompt = f"Analyze: '{food_input}'. Return ONLY JSON: {{'calories': int, 'protein': int, 'carbs': int, 'fat': int}}"
    
    try:
        res = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}], 
            model="llama-3.3-70b-versatile", 
            response_format={"type": "json_object"}
        )
        data = json.loads(res.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail="AI_ANALYSIS_FAILED")
    
    conn = get_db_conn()
    if not conn: raise HTTPException(status_code=500, detail="VAULT_OFFLINE")
    
    try:
        cur = conn.cursor()
        # 1. Log to history (Updated table name to 'xp_history' to match fitbro.py logic)
        cur.execute("""
            INSERT INTO xp_history (operative_id, amount, source) 
            VALUES (%s, %s, %s)
        """, (user_id, 50, f"FUEL: {food_input} ({data['calories']} kcal)"))
        
        # 2. Grant XP to the Operative
        cur.execute("UPDATE operatives SET total_xp = total_xp + 50 WHERE id = %s", (user_id,))
        
        conn.commit()
        return {"status": "SUCCESS", "analysis": data}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally: conn.close()

@router.get("/history/{user_id}")
def fetch_fuel_history(user_id: int):
    conn = get_db_conn()
    from psycopg2.extras import RealDictCursor
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        # Pulling from xp_history since that's where we logged the fuel
        cur.execute("""
            SELECT source as event, amount as xp, timestamp as date 
            FROM xp_history 
            WHERE operative_id = %s AND source LIKE 'FUEL:%%'
            ORDER BY timestamp DESC LIMIT 5
        """, (user_id,))
        return {"history": cur.fetchall()}
    finally: conn.close()