from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta

app = FastAPI()

# 1. ENHANCED_CORS_HANDSHAKE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your specific IP
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"], 
    allow_headers=["*"],
)

# 2. DATABASE_CONNECTION_LOGIC
DB_CONFIG = {
    "dbname": "vanguard_db",
    "user": "postgres",
    "password": "Joelkazadi@1", 
    "host": "localhost",
    "port": "5432"
}
# 1. DEFINE THE DATA STRUCTURE
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

# 2. THE REGISTRATION DOOR
@app.post("/api/register")
async def register_operative(data: OperativeRegistration):
    conn = None
    try:
        conn = get_db_conn()
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
        if conn: conn.rollback()
        print(f"CRITICAL_DB_ERROR: {e}") # This will show the EXACT error in your terminal
        raise HTTPException(status_code=500, detail="Check terminal for DB error")
    finally:
        if conn: conn.close()
def get_db_conn():
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
# THE_DATA_DISPATCHER
@app.get("/vitals/{user_id}")
async def get_vitals(user_id: int):
    conn = None
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Query the 20-column table we built in DBeaver
        query = "SELECT username, current_mass, target_mass, total_xp FROM operatives WHERE id = %s;"
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        
        if result:
            # Send the tactical data back to the dashboard
            return {
                "codename": result['username'],
                "current": float(result['current_mass']),
                "goal": float(result['target_mass']),
                "xp": result['total_xp'],
                "remain": float(result['current_mass']) - float(result['target_mass'])
            }
        else:
            raise HTTPException(status_code=404, detail="OPERATIVE_NOT_FOUND")

    except Exception as e:
        print(f"FETCH_ERROR: {e}")
        raise HTTPException(status_code=500, detail="INTERNAL_SYNC_ERROR")
    finally:
        if conn:
            cursor.close()
            conn.close()
# 3. MODELS
class OperativeBase(BaseModel):
    username: str
    current_mass: float
    target_mass: float
    lactose_intolerant: bool

# 4. ROUTES // THE_DOSSIER

@app.get("/")
async def root():
    return {"status": "VANGUARD_OS_ONLINE", "version": "3.0.5"}

# The route that was 404ing
@app.get("/history/{operative_id}")
async def get_history(operative_id: int):
    # logic here...
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        query = """
            SELECT amount as xp, source as event, timestamp as date 
            FROM xp_history 
            WHERE operative_id = %s 
            ORDER BY timestamp DESC LIMIT 10;
        """
        cursor.execute(query, (operative_id,))
        logs = cursor.fetchall()
        cursor.close()
        conn.close()
        return logs if logs else []
    except Exception as e:
        print(f"SYNC_ERROR: {e}")
        return []

@app.get("/operative/{operative_id}")
async def get_operative_stats(operative_id: int):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM operatives WHERE id = %s", (operative_id,))
        user = cursor.fetchone()
        
        # Calculate Trial Expiry (14 Days)
        trial_end = user['trial_start_date'] + timedelta(days=14)
        days_remaining = (trial_end - datetime.now()).days
        
        user['trial_days_left'] = max(0, days_remaining)
        user['subscription_price'] = "R50.00" # Hardcoded per operative instructions
        
        cursor.close()
        conn.close()
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # THE_DOSSIER_RETRIEVAL
@app.get("/vitals/{user_id}")
async def get_vitals(user_id: int):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Get the latest stats for the operative
        query = "SELECT current_mass, target_mass, total_xp, username FROM operatives WHERE id = %s;"
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if result:
            return {
                "status": "SUCCESS",
                "current": float(result['current_mass']),
                "goal": float(result['target_mass']),
                "xp": result['total_xp'],
                "codename": result['username']
            }
        raise HTTPException(status_code=404, detail="OPERATIVE_NOT_FOUND")
        
    except Exception as e:
        print(f"FETCH_ERROR: {e}")
        raise HTTPException(status_code=500, detail="SYSTEM_SYNC_ERROR")

# 5. SYNC_REPS_COMMAND
@app.post("/api/sync-xp")
async def sync_xp(operative_id: int, amount: int, source: str):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        # Log the XP Transaction
        cursor.execute(
            "INSERT INTO xp_history (operative_id, amount, source) VALUES (%s, %s, %s)",
            (operative_id, amount, source)
        )
        # Update Total XP on Operative Profile
        cursor.execute(
            "UPDATE operatives SET total_xp = total_xp + %s WHERE id = %s",
            (amount, operative_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "SYNC_COMPLETE", "xp_added": amount}
    except Exception as e:
        raise HTTPException(status_code=500, detail="XP_SYNC_FAILED")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)