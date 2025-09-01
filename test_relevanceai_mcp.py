#!/usr/bin/env python3
"""
Test script for RelevanceAI MCP Server
This script demonstrates how to interact with the RelevanceAI MCP server
"""

import json
import asyncio
import aiohttp
from typing import Dict, Any, Optional

class RelevanceAIMCPClient:
    """Client for interacting with RelevanceAI MCP server"""
    
    def __init__(self, server_url: str = "https://gitmcp.io/RelevanceAI/relevanceai"):
        self.server_url = server_url
        self.session = None
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def make_request(self, method: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make a request to the MCP server"""
        if not self.session:
            raise RuntimeError("Session not initialized. Use async context manager.")
        
        payload = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params or {},
            "id": 1
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            async with self.session.post(self.server_url, json=payload, headers=headers) as response:
                result = await response.json()
                return result
        except Exception as e:
            print(f"Error making request: {e}")
            return {"error": str(e)}
    
    async def get_capabilities(self) -> Dict[str, Any]:
        """Get server capabilities"""
        return await self.make_request("initialize")
    
    async def list_tools(self) -> Dict[str, Any]:
        """List available tools from the server"""
        return await self.make_request("tools/list")
    
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call a specific tool with arguments"""
        params = {
            "name": tool_name,
            "arguments": arguments
        }
        return await self.make_request("tools/call", params)

async def test_relevanceai_mcp():
    """Test the RelevanceAI MCP server functionality"""
    print("=" * 60)
    print("RelevanceAI MCP Server Test")
    print("=" * 60)
    
    async with RelevanceAIMCPClient() as client:
        # Test 1: Get server capabilities
        print("\n1. Getting server capabilities...")
        capabilities = await client.get_capabilities()
        print(f"Response: {json.dumps(capabilities, indent=2)[:500]}...")  # Print first 500 chars
        
        # Test 2: List available tools
        print("\n2. Listing available tools...")
        tools = await client.list_tools()
        
        if "result" in tools and "tools" in tools["result"]:
            tool_list = tools["result"]["tools"]
            print(f"Found {len(tool_list)} tools:")
            for tool in tool_list[:5]:  # Show first 5 tools
                print(f"  - {tool.get('name', 'Unknown')}: {tool.get('description', 'No description')[:100]}...")
        else:
            print(f"Tools response: {json.dumps(tools, indent=2)[:500]}...")
        
        # Test 3: Example tool call (if tools are available)
        if "result" in tools and "tools" in tools["result"] and len(tools["result"]["tools"]) > 0:
            first_tool = tools["result"]["tools"][0]
            tool_name = first_tool.get("name")
            
            if tool_name:
                print(f"\n3. Testing tool: {tool_name}")
                # Create sample arguments based on tool schema
                sample_args = {}
                if "inputSchema" in first_tool:
                    schema = first_tool["inputSchema"]
                    if "properties" in schema:
                        for prop, details in schema["properties"].items():
                            if details.get("type") == "string":
                                sample_args[prop] = "test_value"
                            elif details.get("type") == "number":
                                sample_args[prop] = 1
                            elif details.get("type") == "boolean":
                                sample_args[prop] = True
                
                result = await client.call_tool(tool_name, sample_args)
                print(f"Tool call result: {json.dumps(result, indent=2)[:500]}...")

def main():
    """Main function to run the test"""
    print("\nStarting RelevanceAI MCP Server Test...")
    print("Note: This test assumes the MCP server is accessible at the configured URL.")
    print("If the server requires authentication or special setup, you may need to modify this script.\n")
    
    try:
        asyncio.run(test_relevanceai_mcp())
        print("\n✅ Test completed successfully!")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()