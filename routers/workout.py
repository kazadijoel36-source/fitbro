from fastapi import APIRouter
from groq import Groq
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_link

router = APIRouter(prefix="/workout", tags=["Chamber"])
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@router.get("/generate/{user_id}")
def generate_protocol(user_id: int, duration: int, focus: str, gear: str):
    conn = get_db_link()
    cur = conn.cursor()
    cur.execute("SELECT max_pushups FROM user_profiles WHERE user_id = %s", (user_id,))
    push_base = cur.fetchone()[0]
    conn.close()

    prompt = f"[VANGUARD AI] MISSION: {duration}min {focus}. GEAR: {gear}. BASELINE: {push_base} reps. Numbered list only."
    res = client.chat.completions.create(messages=[{"role":"user","content":prompt}], model="llama-3.3-70b-versatile")
    return {"workout": res.choices[0].message.content}