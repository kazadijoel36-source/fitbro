from fastapi import FastAPI, HTTPException
from routers import auth, nutrition, user, workout
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv


load_dotenv()
app = FastAPI()
# This tells the server to look for your HTML/JS/CSS files in the main folder
app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/dashboard")
async def read_index():
    return FileResponse('dashboard.html')

# 1. PRODUCTION_READY_CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500", 
        "http://127.0.0.1:5500", 
        "https://fitbro-os.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# 2. PATTERNED_DATABASE_CONNECTION
def get_db_conn():
    db_url = os.getenv("DATABASE_URL")
    try:
        if db_url:
            return psycopg2.connect(db_url, sslmode='require', cursor_factory=RealDictCursor)
        else:
            return psycopg2.connect(
                dbname="vanguard_db",
                user="postgres",
                password=os.getenv("DB_PASS"), 
                host="localhost",
                port="5432",
                cursor_factory=RealDictCursor
            )
    except Exception as e:
        print(f"DATABASE_CONNECTION_ERROR: {e}")
        return None

class OperativeRegistration(BaseModel):
    username: str
    current_mass: float
    target_mass: float
    height: float
    age: int
    sex: str
    grade: str
    pushups: int
    pullups: int
    steps: int
    injury: str
    lactose: str
    diet: str
    cooking: str
    water: float
    source: str
    why: str
    discipline: int
    obstacle: str
    gear: str

@app.get("/")
async def root():
    return {"status": "VANGUARD_OS_ONLINE", "version": "3.0.5"}

@app.post("/api/register")
async def register_operative(data: OperativeRegistration):
    conn = get_db_conn()
    if not conn: raise HTTPException(status_code=500, detail="DB_LINK_ERROR")
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO operatives (
                username, current_mass, target_mass, height, age, 
                biological_sex, training_grade, pushup_max, pullup_max, 
                step_baseline, system_damage, lactose_intolerant, 
                dietary_protocol, cooking_frequency, water_intake, 
                fuel_source, primary_drive, discipline_level, 
                biggest_obstacle, arsenal_inventory
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """
        cursor.execute(query, (
            data.username, data.current_mass, data.target_mass, data.height, data.age,
            data.sex, data.grade, data.pushups, data.pullups, data.steps,
            data.injury, data.lactose, data.diet, data.cooking, data.water,
            data.source, data.why, data.discipline, data.obstacle, data.gear
        ))
        res = cursor.fetchone()
        conn.commit()
        return {"status": "SUCCESS", "id": res['id']}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/vitals/{user_id}")
async def get_vitals(user_id: int):
    conn = get_db_conn()
    if not conn: raise HTTPException(status_code=500, detail="DB_LINK_ERROR")
    try:
        cursor = conn.cursor()
        query = "SELECT username, current_mass, target_mass, total_xp FROM operatives WHERE id = %s;"
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        if result:
            return {
                "codename": result['username'],
                "current": float(result['current_mass']),
                "goal": float(result['target_mass']),
                "xp": result['total_xp'],
                "remain": float(result['current_mass']) - float(result['target_mass'])
            }
        raise HTTPException(status_code=404, detail="OPERATIVE_NOT_FOUND")
    finally:
        conn.close()

        @app.get("/fuel")
        async def read_fuel():
         return FileResponse('fuel.html')

@app.get("/history/{operative_id}")
async def get_history(operative_id: int):
    conn = get_db_conn()
    try:
        cursor = conn.cursor()
        query = "SELECT amount as xp, source as event, timestamp as date FROM xp_history WHERE operative_id = %s ORDER BY timestamp DESC LIMIT 10;"
        cursor.execute(query, (operative_id,))
        return cursor.fetchall()
    finally:
        conn.close()
app.include_router(auth.router)      # Links your login/signup logic
app.include_router(nutrition.router) # Links your AI fuel analysis
app.include_router(user.router)      # Links vitals and HEALTH-CHECK
app.include_router(workout.router)   # Links the Chamber AI
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
    