import os
import json
from typing import List
from pydantic import BaseModel
from groq import Groq

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
    Parses briefing text using Groq Llama 3.3 70B with JSON Mode to extract
    competitor details and a comparison matrix.
    """
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise ValueError("GROQ_API_KEY not found in environment variables.")
        
    client = Groq(api_key=groq_key)
    
    schema_str = json.dumps(ComparisonMatrix.model_json_schema(), indent=2)
    
    prompt = f"""
    You are an expert market researcher and business analyst. 
    Analyze the competitive research briefing below and extract a highly structured side-by-side comparison matrix.
    
    You must output a JSON object that strictly adheres to the following JSON Schema:
    {schema_str}
    
    Intel Briefing Text:
    ---
    {briefing_text}
    ---
    """
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that outputs JSON matching a specific schema."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.1
    )
    return response.choices[0].message.content
