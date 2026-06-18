import os
import json
from typing import List
from pydantic import BaseModel
from groq import Groq

class SwotAnalysis(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]
    executive_summary: str

def extract_swot_intelligence(briefing_text: str) -> str:
    """
    Parses briefing text using Groq Llama 3.3 70B with JSON Mode to extract
    a structured SWOT analysis and executive summary.
    """
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise ValueError("GROQ_API_KEY not found in environment variables.")
        
    client = Groq(api_key=groq_key)
    
    schema_str = json.dumps(SwotAnalysis.model_json_schema(), indent=2)
    
    prompt = f"""
    You are an expert market researcher and business analyst. 
    Analyze the competitive research briefing below and extract a highly structured SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis.
    
    You must extract:
    1. 3-5 core internal Strengths of the target company.
    2. 3-5 core internal Weaknesses of the target company.
    3. 3-5 core external Opportunities available in the market.
    4. 3-5 core external Threats from competitors or market dynamics.
    5. A 2-3 sentence strategic synthesis executive summary.
    
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
            {"role": "system", "content": "You are a helpful assistant that outputs JSON matching a specific SWOT schema."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.1
    )
    return response.choices[0].message.content
