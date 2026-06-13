import os
from google import genai
from tools.search import search_tavily

def run_company_researcher(company_name: str) -> str:
    """
    Agent 1: Company Researcher.
    Searches the web for company details and generates a structured company profile.
    
    Args:
        company_name: Name of the company to research.
        
    Returns:
        A structured markdown profile of the company.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
        
    # 1. Search Tavily for information on the company
    query = f"{company_name} company overview founding year HQ business model revenue funding products recent news"
    try:
        search_results = search_tavily(query, max_results=6)
    except Exception as e:
        raise RuntimeError(f"Company Researcher failed to search Tavily: {str(e)}")
        
    # 2. Call Gemini 2.5 Flash using the google-genai SDK
    prompt = f"""
You are an expert market research analyst. Your job is to create a structured company profile based on the provided search results.

Company Name: {company_name}

Search Results:
{search_results}

Please synthesize the search results and construct a detailed company profile in markdown. Make sure you cover:
1. Founding details (year, founders if available)
2. Headquarters location
3. Business model (how they make money)
4. Revenue, funding, or valuation (latest available numbers)
5. Core products or services
6. Recent news, key events, or product launches (from the last 12-24 months)

Be factual, concise, and structured. Do not make up information; if certain details are missing, state that they are not publicly available or could not be found in the search results.
"""
    
    try:
        client = genai.Client(api_key=gemini_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        raise RuntimeError(f"Company Researcher failed to generate profile with Gemini: {str(e)}")
