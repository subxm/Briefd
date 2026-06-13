import os
from tavily import TavilyClient

def search_tavily(query: str, max_results: int = 5) -> str:
    """
    Search the web using Tavily API.
    
    Args:
        query: The search query string.
        max_results: The maximum number of search results to retrieve.
        
    Returns:
        A concatenated string of search results (title, URL, content).
    """
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        raise ValueError("TAVILY_API_KEY not found in environment variables.")
        
    try:
        client = TavilyClient(api_key=api_key)
        response = client.search(query=query, max_results=max_results, search_depth="advanced")
        
        results = []
        for item in response.get("results", []):
            title = item.get("title", "No Title")
            url = item.get("url", "No URL")
            content = item.get("content", "No Content")
            results.append(f"Title: {title}\nURL: {url}\nContent: {content}\n---")
            
        if not results:
            return "No search results found."
            
        return "\n\n".join(results)
    except Exception as e:
        raise RuntimeError(f"Tavily search failed for query '{query}': {str(e)}")
