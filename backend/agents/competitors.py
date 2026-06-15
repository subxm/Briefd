import os
from groq import Groq
from tools.search import search_tavily

def run_competitor_finder(company_name: str, company_profile: str) -> str:
    """
    Agent 2: Competitor Finder.
    Identifies top 3-5 competitors using web searches and summarizes their profiles.
    
    Args:
        company_name: Name of the target company.
        company_profile: Output profile from Agent 1 (Company Researcher).
        
    Returns:
        Structured profiles of the top 3-5 competitors.
    """
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise ValueError("GROQ_API_KEY not found in environment variables.")
        
    # 1. Search Tavily for competitors and alternatives
    query = f"{company_name} competitors alternatives rivals market share"
    try:
        search_results = search_tavily(query, max_results=6)
    except Exception as e:
        raise RuntimeError(f"Competitor Finder failed to search Tavily: {str(e)}")
        
    # 2. Call Groq Llama 3.3 70B
    prompt = f"""
You are an expert competitive intelligence analyst. Your job is to identify the top 3-5 competitors for the target company and provide brief profiles for each.

Target Company: {company_name}
Target Company Profile:
{company_profile}

Search Results:
{search_results}

Using the target company's profile and search results, identify the top 3-5 competitors.
For each competitor, provide:
1. Company name and brief overview
2. Core value proposition (why customers choose them)
3. Key products or features that compete directly
4. Estimated size, scale, or market presence relative to the target company

Format your response in structured markdown. Be objective and factual.
"""
    
    try:
        client = Groq(api_key=groq_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert competitive intelligence analyst."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        return response.choices[0].message.content
    except Exception as e:
        raise RuntimeError(f"Competitor Finder failed to analyze competitors with Groq: {str(e)}")
