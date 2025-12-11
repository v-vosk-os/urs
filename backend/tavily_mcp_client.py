"""
Client to connect to remote Tavily Expert MCP Server
"""
import aiohttp
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class TavilyMCPClient:
    def __init__(self, mcp_url: str):
        self.mcp_url = mcp_url
        self.session_id = None
        
    async def get_available_tools(self) -> List[Dict[str, Any]]:
        """Query the MCP server for available tools"""
        try:
            async with aiohttp.ClientSession() as session:
                # Handle URL construction correctly
                url = self.mcp_url
                if "?" in url:
                    base_url, query = url.split("?", 1)
                    if not base_url.endswith("/"):
                        base_url += "/"
                    target_url = f"{base_url}tools?{query}"
                else:
                    if not url.endswith("/"):
                        url += "/"
                    target_url = f"{url}tools"

                # Try to get tools from the MCP server
                async with session.get(target_url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get('tools', [])
                    else:
                        logger.warning(f"MCP server returned status {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Failed to get tools from MCP server: {e}")
            return []
    
    async def call_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Call a tool on the remote MCP server"""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "jsonrpc": "2.0",
                    "id": 1,
                    "method": "tool/call",
                    "params": {
                        "name": tool_name,
                        "arguments": parameters
                    }
                }
                
                async with session.post(
                    self.mcp_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get('result', {})
                    else:
                        error_text = await response.text()
                        logger.error(f"MCP call failed: {response.status} - {error_text}")
                        return {"error": f"MCP call failed: {response.status}"}
                        
        except Exception as e:
            logger.error(f"Error calling MCP tool {tool_name}: {e}")
            return {"error": str(e)}
    
    async def tavily_search_advanced(self, query: str, **kwargs) -> Dict[str, Any]:
        """Advanced search using Tavily Expert"""
        params = {
            "what_is_your_intent": "Search for information using Tavily Expert MCP",
            "query": query,
            **kwargs
        }
        return await self.call_tool("tavily_search_tool", params)
    
    async def tavily_extract_advanced(self, urls: List[str], **kwargs) -> Dict[str, Any]:
        """Advanced extraction using Tavily Expert"""
        params = {
            "what_is_your_intent": "Extract content using Tavily Expert MCP",
            "urls": urls,
            **kwargs
        }
        return await self.call_tool("tavily_extract_tool", params)

