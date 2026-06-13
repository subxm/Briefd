import os
from typing import List
from pydantic import BaseModel
from google import genai
from google.genai import types

class CompetitorFeatureState(BaseModel):
    competitor_name: str
    has: bool

class CompetitorFeature(BaseModel):
    feature_name: str
    target_has: bool
    competitors_have: List[CompetitorFeatureState]

class CompetitorProfile(BaseModel):
    name: str
    strengths: List[str]
    weaknesses: List[str]
    scale: str
    pricing_model: str
    differentiator: str
    strength_score: int  # 1-10 rating relative to target

class ComparisonMatrix(BaseModel):
    target_company_name: str
    competitors: List[CompetitorProfile]
    key_features: List[CompetitorFeature]

def extract_competitors_intelligence(briefing_text: str) -> str:
    """
    Parses briefing text using Gemini with a structured schema to extract
    competitor details and a comparison matrix.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
        
    client = genai.Client(api_key=gemini_key)
    
    prompt = f"""
    You are an expert market researcher and business analyst. 
    Analyze the competitive research briefing below and extract a highly structured side-by-side comparison matrix.
    
    You must extract:
    1. The target company name.
    2. Profiles for each competitor detailed in the report:
       - Name
       - 2-4 key strengths
       - 2-4 key weaknesses
       - Market scale or sizing category (e.g. "Startup", "Scaleup", "Enterprise Giant")
       - Business or pricing model (e.g. "Usage-based SaaS", "Freemium Developer API")
       - Core differentiator (their unique value proposition compared to the target company)
       - Competitive strength rating (1-10, where 10 is the strongest threat)
    3. A side-by-side feature grid:
       - Extract 5-7 key functional capabilities, features, or developer tools compared in the text (e.g. "Auto-scaling", "SOC2 Compliance", "GraphQL support").
       - For each feature, indicate if the target company supports it (true/false).
       - For each feature, list whether each competitor supports it (true/false) using their names.
       
    Intel Briefing Text:
    ---
    {briefing_text}
    ---
    """
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ComparisonMatrix,
            temperature=0.1
        )
    )
    return response.text
