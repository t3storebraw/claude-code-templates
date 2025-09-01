# RelevanceAI MCP Server Integration Guide

## Overview

The RelevanceAI MCP (Model Context Protocol) server provides seamless integration with RelevanceAI's documentation and capabilities through a standardized protocol. This guide explains how to set up and use the RelevanceAI MCP server in your project.

## Configuration

The RelevanceAI MCP server has been configured in `.mcp.json`:

```json
{
  "mcpServers": {
    "relevanceai": {
      "url": "https://gitmcp.io/RelevanceAI/relevanceai"
    }
  }
}
```

**Note:** The URL `https://gitmcp.io/RelevanceAI/relevanceai` is a reference URL for MCP-compatible clients (like Claude Desktop App). This is not a direct API endpoint but rather a registry reference that MCP clients use to locate and connect to the actual server.

## What is RelevanceAI?

RelevanceAI is a platform that provides:
- Vector databases and search capabilities
- AI-powered data processing
- Document analysis and understanding
- Semantic search functionality
- Machine learning model deployment

## Using the MCP Server

### 1. Direct Integration with AI Assistants

If you're using an AI assistant that supports MCP (like Claude with the Desktop app), the server will automatically provide:
- Access to RelevanceAI documentation
- Code examples and best practices
- API reference information
- Troubleshooting guides

### 2. Programmatic Access

You can interact with the MCP server programmatically using the test script provided:

```bash
python test_relevanceai_mcp.py
```

This script demonstrates:
- Connecting to the MCP server
- Listing available tools and capabilities
- Making tool calls to access documentation

### 3. Available Capabilities

The RelevanceAI MCP server typically provides:

#### Documentation Access
- Quick access to API documentation
- Code examples in multiple languages
- Integration guides

#### Search Functionality
- Search through RelevanceAI documentation
- Find specific API endpoints
- Locate configuration examples

#### Best Practices
- Performance optimization tips
- Security recommendations
- Scaling guidelines

## Example Use Cases

### 1. Vector Search Implementation
```python
# The MCP server can provide documentation on:
# - Setting up vector databases
# - Implementing semantic search
# - Optimizing query performance
```

### 2. Document Processing
```python
# Access guides for:
# - Text extraction
# - Document classification
# - Entity recognition
```

### 3. API Integration
```python
# Get examples for:
# - Authentication setup
# - API endpoint usage
# - Error handling
```

## Testing the Integration

Run the provided test script to verify the MCP server connection:

```bash
# Install required dependencies
pip install aiohttp

# Run the test
python test_relevanceai_mcp.py
```

Expected output:
- Server capabilities listing
- Available tools enumeration
- Sample tool execution results

## Troubleshooting

### Connection Issues
If you encounter connection problems:
1. Verify internet connectivity
2. Check if the MCP server URL is accessible
3. Review any firewall or proxy settings

### Authentication
Some MCP servers may require authentication:
- Check if API keys are needed
- Verify credential configuration
- Consult the RelevanceAI documentation

### Tool Errors
If tool calls fail:
- Verify the tool name and parameters
- Check the required argument schema
- Review error messages for specific issues

## Advanced Configuration

### Custom Server Settings
You can extend the configuration with additional parameters:

```json
{
  "mcpServers": {
    "relevanceai": {
      "url": "https://gitmcp.io/RelevanceAI/relevanceai",
      "timeout": 30000,
      "retries": 3
    }
  }
}
```

### Multiple MCP Servers
You can configure multiple MCP servers alongside RelevanceAI:

```json
{
  "mcpServers": {
    "relevanceai": {
      "url": "https://gitmcp.io/RelevanceAI/relevanceai"
    },
    "other-server": {
      "url": "https://example.com/mcp"
    }
  }
}
```

## Integration with Development Workflow

### IDE Integration
- The MCP server can be used with compatible IDEs
- Provides contextual documentation during development
- Offers code completion suggestions

### CI/CD Pipeline
- Validate API usage against documentation
- Ensure compliance with best practices
- Automate documentation updates

## Resources

- [RelevanceAI Documentation](https://docs.relevanceai.com/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [RelevanceAI GitHub](https://github.com/RelevanceAI)

## Support

For issues specific to:
- **MCP Server**: Check the server repository at https://gitmcp.io/RelevanceAI/relevanceai
- **RelevanceAI Platform**: Visit https://relevanceai.com/support
- **Integration Help**: Review this guide and the test script

## Next Steps

1. ✅ MCP server is configured in `.mcp.json`
2. ✅ Test script is available at `test_relevanceai_mcp.py`
3. ✅ Documentation is provided in this guide
4. 🚀 Start using RelevanceAI capabilities through the MCP server

## Contributing

If you find issues or have suggestions for improving the MCP integration:
1. Test your changes with the provided script
2. Document any new capabilities or configurations
3. Submit feedback to the appropriate repository

---

*Last Updated: Configuration completed and ready for use*