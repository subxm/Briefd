import os
import logging
import json
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header, Depends, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pdf_generator import generate_briefing_pdf
from competitors_extractor import extract_competitors_intelligence
from pydantic import BaseModel
import httpx
import stripe

# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Verify API Keys and Supabase configs are loaded (Exit strictly if missing)
required_env_vars = {
    "GEMINI_API_KEY": "Required for running the Gemini LLM agent intelligence chain.",
    "TAVILY_API_KEY": "Required for real-time web search and competitor indexing.",
    "SUPABASE_URL": "Required for database syncing and user profiles.",
    "SUPABASE_ANON_KEY": "Required for client-facing database operations.",
    "SUPABASE_SERVICE_ROLE_KEY": "Required for backend bypass controls and billing calculations.",
    "UPI_ID": "Required for generating direct payment QR codes.",
    "ADMIN_EMAIL": "Required for identifying the admin console user."
}

missing_vars = []
for var, desc in required_env_vars.items():
    val = os.getenv(var)
    if not val or not val.strip():
        missing_vars.append(f"  - {var}: {desc}")

if missing_vars:
    print("\n" + "="*80)
    print("CRITICAL RUNTIME ERROR: Missing Required Environment Configuration")
    print("="*80)
    print("The backend server could not start because the following variables are missing:\n")
    for item in missing_vars:
        print(item)
    print("\nPlease create a .env file inside the backend directory with these values.")
    print("="*80 + "\n")
    import sys
    sys.exit(1)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# UPI & Admin Configuration
UPI_ID = os.getenv("UPI_ID")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

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
    if not authorization or not authorization.lower().startswith("bearer "):
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
            logger.error(
                f"Supabase auth token verification failed on endpoint: {SUPABASE_URL}/auth/v1/user. "
                f"Status code: {auth_response.status_code}. Response: {auth_response.text}"
            )
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

@app.get("/briefings/{briefing_id}/pdf")
async def get_briefing_pdf(briefing_id: int, current_user: dict = Depends(get_current_user)):
    """
    Generates and downloads a beautifully styled PDF of the briefing.
    Only available to Pro tier users.
    """
    if current_user.get("tier") != "pro":
        raise HTTPException(
            status_code=403,
            detail="PDF Export is a premium feature. Please upgrade to the Professional plan to download reports."
        )
        
    briefing = await get_briefing_detail(briefing_id, current_user)
    
    company_name = briefing.get("company_name", "Report")
    briefing_text = briefing.get("briefing_text", "")
    
    try:
        pdf_bytes = generate_briefing_pdf(company_name, briefing_text)
    except Exception as e:
        logger.error(f"Failed to generate PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")
        
    safe_filename = "".join(c for c in company_name if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=Briefd_{safe_filename}_Report.pdf",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@app.get("/briefings/{briefing_id}/competitors")
async def get_briefing_competitors(briefing_id: int, current_user: dict = Depends(get_current_user)):
    """
    Parses the briefing text to extract structured competitor profiles and feature matrix.
    Protected by Auth.
    """
    briefing = await get_briefing_detail(briefing_id, current_user)
    briefing_text = briefing.get("briefing_text", "")
    
    if not briefing_text:
        raise HTTPException(status_code=404, detail="Briefing content is empty.")
        
    try:
        # Generate structured JSON matrix
        matrix_json_str = extract_competitors_intelligence(briefing_text)
        # Parse it back to python dict to return as JSON response
        matrix_data = json.loads(matrix_json_str)
        return matrix_data
    except Exception as e:
        logger.error(f"Failed to extract competitor intelligence: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze competitors: {str(e)}")

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


# --- UPI P2P PAYMENTS & ADMIN AUDIT ENDPOINTS ---

class UpiPaymentSubmitRequest(BaseModel):
    utr: str

@app.get("/payments/config")
async def get_payments_config():
    """
    Returns public payment configurations (UPI ID).
    """
    return {"upi_id": UPI_ID}

@app.post("/payments/upi-submit")
async def upi_submit(payload: UpiPaymentSubmitRequest, current_user: dict = Depends(get_current_user)):
    """
    Submits a UPI payment UTR code, records it, and immediately upgrades the user to Pro.
    """
    user_id = current_user["id"]
    user_email = current_user["email"]
    utr = payload.utr.strip()
    
    # Validate UTR: Must be exactly 12 numeric digits
    if not utr.isdigit() or len(utr) != 12:
        raise HTTPException(status_code=400, detail="Invalid UTR. It must be exactly 12 numeric digits.")
        
    logger.info(f"Processing P2P UPI submission for user: {user_id}, UTR: {utr}")
    
    async with httpx.AsyncClient() as client:
        try:
            # 1. Insert transaction record into upi_payments table
            db_response = await client.post(
                f"{SUPABASE_URL}/rest/v1/upi_payments",
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json={
                    "user_id": user_id,
                    "email": user_email,
                    "utr": utr,
                    "amount": 499,
                    "status": "approved"
                }
            )
            
            if db_response.status_code not in [200, 201, 204]:
                # Check for duplicate key violation (indicating UTR already submitted)
                if "duplicate key" in db_response.text.lower() or "unique_violation" in db_response.text.lower() or db_response.status_code == 409:
                    raise HTTPException(status_code=400, detail="This UPI transaction ID (UTR) has already been submitted.")
                logger.error(f"Failed to record UPI payment: {db_response.text}")
                raise HTTPException(status_code=500, detail="Failed to record payment transaction.")
                
            # 2. Immediately upgrade user tier to pro
            profile_response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}",
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "tier": "pro"
                }
            )
            
            if profile_response.status_code not in [200, 201, 204]:
                logger.error(f"Failed to patch user profile to Pro: {profile_response.text}")
                raise HTTPException(status_code=500, detail="Failed to upgrade user profile in database.")
                
            logger.info(f"Successfully upgraded user {user_email} to Pro via direct UPI payment.")
            return {"status": "success", "message": "Successfully upgraded to Pro tier."}
            
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Database error during UPI submission: {e}")
            raise HTTPException(status_code=500, detail="Failed to connect to database.")

@app.get("/admin/payments")
async def get_admin_payments(current_user: dict = Depends(get_current_user)):
    """
    Retrieves all UPI payment submissions (Admin Only).
    """
    user_email = current_user["email"]
    if user_email.lower() != ADMIN_EMAIL.lower():
        raise HTTPException(status_code=403, detail="Forbidden. Admin access only.")
        
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SUPABASE_URL}/rest/v1/upi_payments?order=created_at.desc",
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
                }
            )
            if response.status_code != 200:
                logger.error(f"Failed to fetch payment submissions: {response.text}")
                raise HTTPException(status_code=500, detail="Failed to fetch transactions.")
            return response.json()
        except Exception as e:
            logger.error(f"Failed to connect to DB: {e}")
            raise HTTPException(status_code=500, detail="Failed to connect to database.")

class RevokePaymentRequest(BaseModel):
    user_id: str
    payment_id: str

@app.post("/admin/payments/revoke")
async def admin_revoke_payment(payload: RevokePaymentRequest, current_user: dict = Depends(get_current_user)):
    """
    Revokes a payment and downgrades the target user back to 'free' (Admin Only).
    """
    user_email = current_user["email"]
    if user_email.lower() != ADMIN_EMAIL.lower():
        raise HTTPException(status_code=403, detail="Forbidden. Admin access only.")
        
    target_user_id = payload.user_id
    payment_id = payload.payment_id
    
    logger.info(f"Admin revoking payment: {payment_id} for user: {target_user_id}")
    
    async with httpx.AsyncClient() as client:
        try:
            # 1. Update payment status to 'revoked'
            pay_response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/upi_payments?id=eq.{payment_id}",
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "status": "revoked"
                }
            )
            if pay_response.status_code not in [200, 201, 204]:
                logger.error(f"Failed to update payment status: {pay_response.text}")
                raise HTTPException(status_code=500, detail="Failed to update transaction status.")
                
            # 2. Downgrade user to 'free' in profiles table
            profile_response = await client.patch(
                f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{target_user_id}",
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "tier": "free"
                }
            )
            if profile_response.status_code not in [200, 201, 204]:
                logger.error(f"Failed to downgrade user profile: {profile_response.text}")
                raise HTTPException(status_code=500, detail="Failed to update user profile in database.")
                
            logger.info(f"Admin successfully revoked Pro access for user ID: {target_user_id}")
            return {"status": "success", "message": "Successfully revoked Pro tier and downgraded user."}
            
        except Exception as e:
            logger.error(f"Failed to connect to database for revocation: {e}")
            raise HTTPException(status_code=500, detail="Failed to connect to database.")


