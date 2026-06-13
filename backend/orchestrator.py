import asyncio
import json
import logging
from typing import AsyncGenerator
from agents.company import run_company_researcher
from agents.competitors import run_competitor_finder
from agents.positioning import run_market_positioning_analyst
from agents.briefing import run_briefing_writer

logger = logging.getLogger(__name__)

async def run_research_pipeline(company: str) -> AsyncGenerator[str, None]:
    """
    Orchestrates the 4 competitive intelligence agents sequentially.
    Yields Server-Sent Events (SSE) detailing the progress and results of each step.
    
    Args:
        company: The name of the company to research.
        
    Yields:
        SSE-formatted string chunks.
    """
    company_profile = ""
    competitor_profiles = ""
    positioning_analysis = ""
    briefing = ""

    # Helper function to format SSE messages
    def format_sse(event: str, data: dict) -> str:
        return f"event: {event}\ndata: {json.dumps(data)}\n\n"

    # --- Agent 1: Company Researcher ---
    yield format_sse("agent_start", {"agent": 1, "name": "Company Researcher"})
    try:
        company_profile = await asyncio.to_thread(run_company_researcher, company)
        yield format_sse("agent_done", {"agent": 1, "result": company_profile})
    except Exception as e:
        logger.error(f"Error in Agent 1: {str(e)}")
        yield format_sse("error", {"message": f"Company Researcher failed: {str(e)}"})
        return

    # --- Agent 2: Competitor Finder ---
    yield format_sse("agent_start", {"agent": 2, "name": "Competitor Finder"})
    try:
        competitor_profiles = await asyncio.to_thread(run_competitor_finder, company, company_profile)
        yield format_sse("agent_done", {"agent": 2, "result": competitor_profiles})
    except Exception as e:
        logger.error(f"Error in Agent 2: {str(e)}")
        yield format_sse("error", {"message": f"Competitor Finder failed: {str(e)}"})
        return

    # --- Agent 3: Market Positioning Analyst ---
    yield format_sse("agent_start", {"agent": 3, "name": "Market Positioning Analyst"})
    try:
        positioning_analysis = await asyncio.to_thread(
            run_market_positioning_analyst, company, company_profile, competitor_profiles
        )
        yield format_sse("agent_done", {"agent": 3, "result": positioning_analysis})
    except Exception as e:
        logger.error(f"Error in Agent 3: {str(e)}")
        yield format_sse("error", {"message": f"Market Positioning Analyst failed: {str(e)}"})
        return

    # --- Agent 4: Briefing Writer ---
    yield format_sse("agent_start", {"agent": 4, "name": "Briefing Writer"})
    try:
        briefing = await asyncio.to_thread(
            run_briefing_writer, company, company_profile, competitor_profiles, positioning_analysis
        )
        yield format_sse("agent_done", {"agent": 4, "result": briefing})
    except Exception as e:
        logger.error(f"Error in Agent 4: {str(e)}")
        yield format_sse("error", {"message": f"Briefing Writer failed: {str(e)}"})
        return

    # --- Pipeline Complete ---
    yield format_sse("complete", {"briefing": briefing})
