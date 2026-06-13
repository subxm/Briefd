import os
from google import genai
from tools.search import search_tavily

def run_market_positioning_analyst(company_name: str, company_profile: str, competitor_profiles: str) -> str:
    """
    Agent 3: Market Positioning Analyst.
    Analyzes the target company's market positioning, strengths vs competitors, and differentiation.
    
    Args:
        company_name: Name of the target company.
        company_profile: Output profile from Agent 1.
        competitor_profiles: Output competitor profiles from Agent 2.
        
    Returns:
        Structured market positioning analysis.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
        
    # 1. Search Tavily for market trends and size in the company's domain
    query = f"{company_name} industry market size growth rate trends future outlook"
    try:
        search_results = search_tavily(query, max_results=6)
    except Exception as e:
        raise RuntimeError(f"Market Positioning Analyst failed to search Tavily: {str(e)}")
        
    # 2. Call Gemini 2.5 Flash using the google-genai SDK
    prompt = f"""
You are a senior market strategist. Your job is to analyze the market positioning of the target company relative to its competitors and general industry trends.

Target Company: {company_name}

Target Company Profile:
{company_profile}

Competitor Profiles:
{competitor_profiles}

Search Results on Industry/Market Trends:
{search_results}

Please synthesize the above information and produce a comprehensive market positioning analysis:
1. **Market Context & Trends**: Describe the overall market size, growth rate, and key trends shaping this space.
2. **Target Company Positioning**: Explain where the target company sits in the market (e.g., premium, low-cost, developer-focused, enterprise-focused).
3. **Strengths vs. Competitors**: List the core advantages the target company has over the competitors identified.
4. **Key Differentiation**: Detail the unique value proposition or "moat" that sets the target company apart.

Format your response in structured markdown. Be analytical, critical, and strategic.
"""
    
    try:
        client = genai.Client(api_key=gemini_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        raise RuntimeError(f"Market Positioning Analyst failed to analyze market with Gemini: {str(e)}")
