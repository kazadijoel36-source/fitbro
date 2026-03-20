from fastapi import APIRouter, Query
from groq import Groq
import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_conn

router = APIRouter(tags=["Nutrition Vault"])
# Securely pulls the key you added to Render/ProBook env
client = Groq(api_key=os.getenv("GROK_API_KEY"))

@router.post("/ai-log")
def analyze_and_log_fuel(user_id: int, food_input: str = Query(...)):
    prompt = f"Analyze: '{food_input}'. Return ONLY JSON: {{'calories': int, 'protein': int, 'carbs': int, 'fat': int}}"
    
    res = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}], 
        model="llama-3.3-70b-versatile", 
        response_format={"type": "json_object"}
    )
    data = json.loads(res.choices[0].message.content)
    
    conn = get_db_conn()
    try:
        cur = conn.cursor()
        # 1. Log to history
        cur.execute("INSERT INTO nutrition_logs (user_id, calories, meal_description) VALUES (%s, %s, %s)", 
                    (user_id, data['calories'], food_input))
        
        # 2. Grant XP and Update Level
        cur.execute("UPDATE user_profiles SET xp = xp + 50 WHERE user_id = %s", (user_id,))
        
        # 3. Mark Daily Mission Complete
        cur.execute("""
            INSERT INTO daily_missions (user_id, nutrition_target, mission_date) 
            VALUES (%s, TRUE, CURRENT_DATE) 
            ON CONFLICT (user_id, mission_date) DO UPDATE SET nutrition_target = TRUE
        """, (user_id,))
        
        conn.commit()
        return {"status": "SUCCESS", "analysis": data}
    finally: conn.close()

@router.get("/history/{user_id}")
def fetch_fuel_history(user_id: int):
    conn = get_db_conn()
    from psycopg2.extras import RealDictCursor
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM nutrition_logs WHERE user_id = %s ORDER BY log_date DESC LIMIT 5", (user_id,))
        return {"history": cur.fetchall()}
    finally: conn.close()