import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("Checking environment variables:")
print(f"GEMINI_API_KEY: {os.getenv('GEMINI_API_KEY')[:10]}... (length: {len(os.getenv('GEMINI_API_KEY')) if os.getenv('GEMINI_API_KEY') else 0})")
print(f"TAVILY_API_KEY: {os.getenv('TAVILY_API_KEY')[:10]}... (length: {len(os.getenv('TAVILY_API_KEY')) if os.getenv('TAVILY_API_KEY') else 0})")

from tools.search import search_tavily
from agents.company import run_company_researcher

async def test_search():
    print("\nTesting Tavily Search...")
    results = search_tavily("Notion company overview founding year", max_results=2)
    print("Search results snippet:")
    print(results[:500])
    
    print("\nTesting Company Researcher Agent...")
    profile = run_company_researcher("Notion")
    print("Generated profile:")
    print(profile[:1000])

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_search())
