import os
import psycopg2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# 1. LOAD_ENVIRONMENT
load_dotenv()
app = FastAPI(title="Vanguard OS API")

# 2. MOUNT_STATIC_FILES
# This allows https://fitbro-os.onrender.com/dashboard to work
app.mount("/static", StaticFiles(directory="."), name="static")

# 3. GLOBAL_SECURITY_CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows phone and ProBook access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. IMPORT_TACTICAL_ROUTERS
# We import the logic from your sub-folders
from routers import auth, nutrition, user, workout

# 5. REGISTER_ROUTERS (The Neural Link)
# We add prefixes to avoid conflicts with your HTML files
app.include_router(auth.router, prefix="/api")
app.include_router(nutrition.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(workout.router, prefix="/api")

# --- CORE_PAGE_ROUTING ---

@app.get("/")
async def root():
    """System Heartbeat"""
    return {"status": "VANGUARD_OS_ONLINE", "version": "3.0.5"}

@app.get("/dashboard")
async def read_dashboard():
    return FileResponse('dashboard.html')

@app.get("/fuel")
async def read_fuel():
    return FileResponse('fuel.html')

@app.get("/medals")
async def read_medals():
    return FileResponse('medals.html')

@app.get("/chamber")
async def read_chamber():
    return FileResponse('chamber.html')

@app.get("/profile")
async def read_profile():
    return FileResponse('profile.html')

if __name__ == "__main__":
    import uvicorn
    import os
    # Render requires 0.0.0.0 and the dynamic PORT variable
    port = int(os.environ.get("PORT", 10000)) 
    uvicorn.run("fitbro:app", host="0.0.0.0", port=port, reload=False)