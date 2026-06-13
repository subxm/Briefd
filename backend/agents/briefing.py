import os
from google import genai

def run_briefing_writer(company_name: str, company_profile: str, competitor_profiles: str, positioning_analysis: str) -> str:
    """
    Agent 4: Briefing Writer.
    Synthesizes the output of the previous three agents into a single, cohesive,
    and polished competitive intelligence briefing.
    
    Args:
        company_name: Name of the target company.
        company_profile: Output profile from Agent 1.
        competitor_profiles: Output competitor profiles from Agent 2.
        positioning_analysis: Output market positioning analysis from Agent 3.
        
    Returns:
        The final competitive intelligence briefing in the exact specified markdown structure.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
        
    prompt = f"""
You are a elite executive intelligence writer. Your task is to synthesize the three research reports below into a final, client-ready Competitive Intelligence Briefing for the target company: {company_name}.

Do not do any new search. Synthesize and polish the existing information to make it highly executive, crisp, and analytical.

Reports to Synthesize:
---
REPORT 1 (Company Profile):
{company_profile}

REPORT 2 (Competitor Profiles):
{competitor_profiles}

REPORT 3 (Market Positioning Analysis):
{positioning_analysis}
---

Your response MUST follow this EXACT format, using exactly these markdown headings (do not add prefix numbers or outer titles, start directly with "## Company Snapshot"):

## Company Snapshot
[Synthesize details about {company_name}'s founding, headquarters, business model, products, and latest financial/revenue/funding scale.]

## Competitive Landscape
[Synthesize the profiles of the top 3-5 competitors, outlining who they are, their scale, and how they compare to {company_name}.]

## Market Position
[Synthesize where {company_name} sits in the broader market, its differentiation, and its core strengths vs competitors in the context of current industry trends.]

## Strategic Insights
[Extract actionable strategic insights or opportunities for {company_name} based on the competitive landscape and market trends.]

## Key Risks
[Detail the critical competitive, market, or product risks that {company_name} faces going forward.]

Write in a professional, objective, high-density business style.
"""
    
    try:
        client = genai.Client(api_key=gemini_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        raise RuntimeError(f"Briefing Writer failed to generate final briefing with Gemini: {str(e)}")
