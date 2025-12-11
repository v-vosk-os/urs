"""
MCP (Model Context Protocol) Server for URS
This implements a basic MCP server that can be extended with custom tools
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app for MCP server
app = FastAPI(title="URS MCP Server", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MCP Server State
class MCPServer:
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}
        self.tools: Dict[str, callable] = {}
        self.sessions: Dict[str, Dict] = {}
        self.register_default_tools()
    
    def register_default_tools(self):
        """Register default MCP tools"""
        self.tools = {
            "search": self.tool_search,
            "extract": self.tool_extract,
            "summarize": self.tool_summarize,
            "analyze": self.tool_analyze,
            "store": self.tool_store,
            "retrieve": self.tool_retrieve,
        }
    
    async def tool_search(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Search tool implementation"""
        query = params.get("query", "")
        return {
            "type": "search_result",
            "query": query,
            "results": [
                {"title": "Example Result 1", "url": "https://example.com/1", "snippet": "Example snippet 1"},
                {"title": "Example Result 2", "url": "https://example.com/2", "snippet": "Example snippet 2"},
            ],
            "timestamp": datetime.now().isoformat()
        }
    
    async def tool_extract(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Extract tool implementation"""
        url = params.get("url", "")
        return {
            "type": "extract_result",
            "url": url,
            "content": f"Extracted content from {url}",
            "metadata": {
                "title": "Example Page",
                "author": "Example Author",
                "date": datetime.now().isoformat()
            }
        }
    
    async def tool_summarize(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Summarize tool implementation"""
        text = params.get("text", "")
        max_length = params.get("max_length", 200)
        return {
            "type": "summary_result",
            "original_length": len(text),
            "summary": text[:max_length] + "..." if len(text) > max_length else text,
            "timestamp": datetime.now().isoformat()
        }
    
    async def tool_analyze(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze tool implementation"""
        data = params.get("data", {})
        analysis_type = params.get("type", "general")
        return {
            "type": "analysis_result",
            "analysis_type": analysis_type,
            "insights": [
                "Insight 1: Data shows interesting pattern",
                "Insight 2: Further investigation recommended"
            ],
            "recommendations": [
                "Consider additional data sources",
                "Perform deeper analysis on specific areas"
            ],
            "timestamp": datetime.now().isoformat()
        }
    
    async def tool_store(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Store data in session"""
        session_id = params.get("session_id", str(uuid.uuid4()))
        key = params.get("key", "")
        value = params.get("value", None)
        
        if session_id not in self.sessions:
            self.sessions[session_id] = {}
        
        self.sessions[session_id][key] = value
        
        return {
            "type": "store_result",
            "session_id": session_id,
            "key": key,
            "success": True,
            "timestamp": datetime.now().isoformat()
        }
    
    async def tool_retrieve(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Retrieve data from session"""
        session_id = params.get("session_id", "")
        key = params.get("key", "")
        
        value = None
        if session_id in self.sessions and key in self.sessions[session_id]:
            value = self.sessions[session_id][key]
        
        return {
            "type": "retrieve_result",
            "session_id": session_id,
            "key": key,
            "value": value,
            "timestamp": datetime.now().isoformat()
        }
    
    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle MCP protocol requests"""
        method = request.get("method", "")
        params = request.get("params", {})
        request_id = request.get("id", None)
        
        response = {
            "jsonrpc": "2.0",
            "id": request_id
        }
        
        try:
            if method == "initialize":
                response["result"] = {
                    "capabilities": {
                        "tools": list(self.tools.keys()),
                        "features": ["search", "extract", "ai_skills", "session_storage"]
                    },
                    "version": "1.0.0"
                }
            
            elif method == "tool/call":
                tool_name = params.get("name", "")
                tool_params = params.get("arguments", {})
                
                if tool_name in self.tools:
                    result = await self.tools[tool_name](tool_params)
                    response["result"] = result
                else:
                    response["error"] = {
                        "code": -32601,
                        "message": f"Tool '{tool_name}' not found"
                    }
            
            elif method == "tool/list":
                response["result"] = {
                    "tools": [
                        {
                            "name": name,
                            "description": func.__doc__ or f"{name} tool",
                            "parameters": {}
                        }
                        for name, func in self.tools.items()
                    ]
                }
            
            elif method == "ping":
                response["result"] = {"pong": True, "timestamp": datetime.now().isoformat()}
            
            else:
                response["error"] = {
                    "code": -32601,
                    "message": f"Method '{method}' not found"
                }
        
        except Exception as e:
            response["error"] = {
                "code": -32603,
                "message": str(e)
            }
            logger.error(f"Error handling request: {e}")
        
        return response

# Initialize MCP server instance
mcp_server = MCPServer()

# WebSocket endpoint for MCP protocol
@app.websocket("/mcp/ws")
async def mcp_websocket(websocket: WebSocket):
    await websocket.accept()
    connection_id = str(uuid.uuid4())
    mcp_server.connections[connection_id] = websocket
    
    logger.info(f"MCP client connected: {connection_id}")
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            request = json.loads(data)
            
            # Handle the request
            response = await mcp_server.handle_request(request)
            
            # Send response back to client
            await websocket.send_text(json.dumps(response))
    
    except WebSocketDisconnect:
        logger.info(f"MCP client disconnected: {connection_id}")
        del mcp_server.connections[connection_id]
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if connection_id in mcp_server.connections:
            del mcp_server.connections[connection_id]

# REST endpoint for MCP calls (alternative to WebSocket)
@app.post("/mcp/call")
async def mcp_call(request: Dict[str, Any]):
    """REST endpoint for MCP calls"""
    response = await mcp_server.handle_request(request)
    return response

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "server": "MCP Server",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "active_connections": len(mcp_server.connections),
        "active_sessions": len(mcp_server.sessions),
        "available_tools": list(mcp_server.tools.keys())
    }

# List available tools
@app.get("/mcp/tools")
async def list_tools():
    return {
        "tools": [
            {
                "name": name,
                "description": func.__doc__ or f"{name} tool",
                "available": True
            }
            for name, func in mcp_server.tools.items()
        ]
    }

# Run the MCP server
if __name__ == "__main__":
    import uvicorn
    # Use import string to enable reload
    uvicorn.run("mcp_server:app", host="0.0.0.0", port=8001, reload=True)
