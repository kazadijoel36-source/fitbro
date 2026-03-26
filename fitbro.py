import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# 1. LOAD_ENVIRONMENT
load_dotenv()
app = FastAPI(title="Vanguard OS")

# 2. MOUNT_STATIC_FILES
# Create the folder if it doesn't exist
if not os.path.exists("static"):
    os.makedirs("static")
# Use lowercase 'static' for compatibility
app.mount("/static", StaticFiles(directory="static"), name="static")

# 3. GLOBAL_SECURITY_CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. REGISTER_ROUTERS
from routers import auth, nutrition, user, workout
app.include_router(auth.router, prefix="/api")
app.include_router(nutrition.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(workout.router, prefix="/api")

# --- CORE_PAGE_ROUTING ---

@app.get("/")
async def read_index():
    """THIS IS YOUR LANDING PAGE"""
    return FileResponse('index.html')

@app.get("/onboarding")
async def read_onboarding():
    return FileResponse('onboarding.html')

@app.get("/dashboard")
async def read_dashboard():
    return FileResponse('dashboard.html')

@app.get("/fuel")
async def read_fuel():
    return FileResponse('fuel.html')

# 5. SYSTEM_BOOT
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("fitbro:app", host="0.0.0.0", port=port)