import os
import logging
import json
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx

# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Verify API Keys are loaded
if not os.getenv("GEMINI_API_KEY") or not os.getenv("TAVILY_API_KEY"):
    logger.warning("Warning: GEMINI_API_KEY or TAVILY_API_KEY is missing from environment variables.")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY or not SUPABASE_SERVICE_ROLE_KEY:
    logger.error("Error: Supabase environment variables (URL, ANON_KEY, SERVICE_ROLE_KEY) are missing.")

from orchestrator import run_research_pipeline

app = FastAPI(
    title="Briefd — Competitive Research Multi-Agent Tool Backend",
    description="FastAPI service integrated with Supabase Auth, database history, and sequential research agents.",
    version="3.0.0"
)

# Enable CORS for the React development server and production deployment
allowed_origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH PYDANTIC MODELS ---
class ResearchRequest(BaseModel):
    company: str

# --- MIDDLEWARE / DEPENDENCY FOR SUPABASE AUTH VALIDATION ---
async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized. Missing or invalid Bearer token.")
        
    token = authorization.split(" ")[1]
    
    # 1. Verify access token against Supabase Auth API
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": SUPABASE_ANON_KEY
                }
            )
        except Exception as e:
            logger.error(f"Supabase Auth connection failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to connect to authentication server.")
            
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Unauthorized. Invalid session token.")
            
        supabase_user = auth_response.json()
        
    # 2. Fetch corresponding profile record from public.profiles
    async with httpx.AsyncClient() as client:
        try:
            profile_response = await client.get(
                f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{supabase_user['id']}",
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
                }
            )
        except Exception as e:
            logger.error(f"Supabase Database connection failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to connect to database.")
            
        if profile_response.status_code == 200 and profile_response.json():
            profile = profile_response.json()[0]
        else:
            # Fallback if profile trigger is delayed
            profile = {
                "id": supabase_user["id"],
                "email": supabase_user["email"],
                "name": supabase_user.get("user_metadata", {}).get("name", "User"),
                "tier": "free",
                "scans_today": 0,
                "last_scan_date": "",
                "total_scans": 0
            }
            
    return profile

# --- AUTH ENDPOINTS ---
@app.get("/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Returns details of the currently logged-in user profile from public.profiles.
    """
    return {"user": current_user}

@app.post("/auth/upgrade")
async def upgrade_user(current_user: dict = Depends(get_current_user)):
    """
    Upgrades the authenticated user's billing tier to 'pro' in Supabase.
    """
    user_id = current_user["id"]
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}",
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json={
                    "tier": "pro"
                }
            )
        except Exception as e:
            logger.error(f"Failed to submit upgrade patch: {e}")
            raise HTTPException(status_code=500, detail="Database connection error.")
            
        if response.status_code not in [200, 201, 204]:
            raise HTTPException(status_code=500, detail="Failed to update tier in database.")
            
        updated_user = response.json()[0] if response.json() else None
        
    if not updated_user:
        current_user["tier"] = "pro"
        updated_user = current_user
        
    return {
        "message": "Successfully upgraded to Professional.",
        "user": updated_user
    }

# --- BRIEFINGS ENDPOINTS ---
@app.get("/briefings")
async def get_briefings(current_user: dict = Depends(get_current_user)):
    """
    Returns the list of historical briefs generated by the user.
    """
    user_id = current_user["id"]
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/briefings?user_id=eq.{user_id}&select=id,company_name,created_at&order=created_at.desc",
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
                }
            )
        except Exception as e:
            logger.error(f"Failed to fetch briefings: {e}")
            raise HTTPException(status_code=500, detail="Database retrieval error.")
            
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch briefings history.")
            
        return response.json()

@app.get("/briefings/{briefing_id}")
async def get_briefing_detail(briefing_id: int, current_user: dict = Depends(get_current_user)):
    """
    Retrieves full details of a specific briefing if it belongs to the user.
    """
    user_id = current_user["id"]
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/briefings?id=eq.{briefing_id}&user_id=eq.{user_id}",
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
                }
            )
        except Exception as e:
            logger.error(f"Failed to fetch briefing detail: {e}")
            raise HTTPException(status_code=500, detail="Database retrieval error.")
            
        if response.status_code != 200 or not response.json():
            raise HTTPException(status_code=404, detail="Briefing not found.")
            
        return response.json()[0]

# --- RESEARCH PIPELINE ENDPOINT ---
@app.get("/")
def read_root():
    return {"status": "healthy", "service": "Briefd Multi-Agent Tool API"}

@app.post("/research")
async def research(request: ResearchRequest, current_user: dict = Depends(get_current_user)):
    """
    POST /research
    Checks daily credits limit, runs agents sequentially, streams progress,
    and saves the completed briefing report to Supabase.
    """
    if not request.company or not request.company.strip():
        raise HTTPException(status_code=400, detail="Company name cannot be empty.")
        
    user_id = current_user["id"]
    tier = current_user.get("tier", "free")
    scans_today = current_user.get("scans_today", 0)
    last_scan_date = current_user.get("last_scan_date", "")
    total_scans = current_user.get("total_scans", 0)
    
    today_str = datetime.utcnow().date().isoformat()
    
    # Reset daily limit count if it's a new day
    if last_scan_date != today_str:
        scans_today = 0
        last_scan_date = today_str
        
    # Check limit for Free tier
    if tier == "free" and scans_today >= 2:
        raise HTTPException(
            status_code=403,
            detail="Daily limit reached. Free Starter tier is limited to 2 briefings per day. Upgrade to Professional for unlimited credits."
        )
        
    # Increment counters
    scans_today += 1
    total_scans += 1
    
    # Save incremented counts to Supabase
    async with httpx.AsyncClient() as client:
        try:
            update_response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}",
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "scans_today": scans_today,
                    "last_scan_date": last_scan_date,
                    "total_scans": total_scans
                }
            )
            if update_response.status_code not in [200, 201, 204]:
                logger.error(f"Failed to update scan counter in database: {update_response.text}")
        except Exception as e:
            logger.error(f"Failed to submit scan counter update: {e}")
            
    logger.info(f"Initiating competitive research pipeline for: {request.company} by user: {current_user['email']}")
    
    async def sse_wrapper():
        company_name = request.company.strip()
        briefing_text = ""
        async for chunk in run_research_pipeline(company_name):
            yield chunk
            if "event: complete" in chunk:
                for line in chunk.split("\n"):
                    if line.startswith("data:"):
                        try:
                            data = json.loads(line[5:])
                            briefing_text = data.get("briefing", "")
                        except Exception as e:
                            logger.error(f"Error parsing final briefing json from SSE: {e}")
                            
        # Persist completed briefing report to Supabase briefings table
        if briefing_text:
            async with httpx.AsyncClient() as client:
                try:
                    brief_response = await client.post(
                        f"{SUPABASE_URL}/rest/v1/briefings",
                        headers={
                            "apikey": SUPABASE_SERVICE_ROLE_KEY,
                            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "user_id": user_id,
                            "company_name": company_name,
                            "briefing_text": briefing_text
                        }
                    )
                    if brief_response.status_code not in [200, 201, 204]:
                        logger.error(f"Failed to save briefing to Supabase briefings table: {brief_response.text}")
                except Exception as e:
                    logger.error(f"Failed to submit briefing persistence: {e}")
                    
    return StreamingResponse(
        sse_wrapper(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
