from fastapi import APIRouter, HTTPException
from groq import Groq
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_conn

router = APIRouter(prefix="/workout", tags=["Chamber"])
client = Groq(api_key=os.getenv("GROK_API_KEY"))

@router.get("/generate/{user_id}")
def generate_protocol(user_id: int, duration: int, focus: str, gear: str):
    conn = get_db_conn()
    if not conn: raise HTTPException(status_code=500, detail="DB_LINK_SEVERED")
    try:
        cur = conn.cursor()
        cur.execute("SELECT max_pushups FROM user_profiles WHERE user_id = %s", (user_id,))
        res = cur.fetchone()
        push_base = res[0] if res else 10
        conn.close()

        prompt = f"[VANGUARD AI] MISSION: {duration}min {focus}. GEAR: {gear}. BASELINE: {push_base} reps. Numbered list only."
        res = client.chat.completions.create(messages=[{"role":"user","content":prompt}], model="llama-3.3-70b-versatile")
        return {"workout": res.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))