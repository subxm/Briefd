import os
from groq import Groq
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
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise ValueError("GROQ_API_KEY not found in environment variables.")
        
    # 1. Search Tavily for information on the company
    query = f"{company_name} company overview founding year HQ business model revenue funding products recent news"
    try:
        search_results = search_tavily(query, max_results=6)
    except Exception as e:
        raise RuntimeError(f"Company Researcher failed to search Tavily: {str(e)}")
        
    # 2. Call Groq Llama 3.3 70B
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
        client = Groq(api_key=groq_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert market research analyst."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        return response.choices[0].message.content
    except Exception as e:
        raise RuntimeError(f"Company Researcher failed to generate profile with Groq: {str(e)}")
