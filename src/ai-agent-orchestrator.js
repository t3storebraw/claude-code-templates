const RedisCache = require('../redis-integration/redis-cache');
const FileSystemMCP = require('../mcp-tools/filesystem-mcp');
const DatabaseMCP = require('../mcp-tools/database-mcp');
const WebSearchMCP = require('../mcp-tools/web-search-mcp');
const winston = require('winston');
const crypto = require('crypto');

class AIAgentOrchestrator {
  constructor(config = {}) {
    this.config = {
      redis: config.redis || {},
      mcp: config.mcp || {},
      logging: config.logging || {},
      ...config
    };

    this.redis = null;
    this.mcpTools = new Map();
    this.logger = this.setupLogger();
    this.isInitialized = false;
  }

  setupLogger() {
    return winston.createLogger({
      level: this.config.logging.level || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'ai-agent-orchestrator' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }

  async initialize() {
    try {
      this.logger.info('Initializing AI Agent Orchestrator');

      // Initialize Redis
      this.redis = new RedisCache(this.config.redis);
      const redisResult = await this.redis.connect();
      if (!redisResult.success) {
        throw new Error(`Redis connection failed: ${redisResult.error}`);
      }

      // Initialize MCP Tools
      await this.initializeMCPTools();

      this.isInitialized = true;
      this.logger.info('AI Agent Orchestrator initialized successfully');

      return { success: true, message: 'Orchestrator initialized' };
    } catch (error) {
      this.logger.error('Initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  async initializeMCPTools() {
    const tools = [
      { name: 'filesystem_mcp', class: FileSystemMCP },
      { name: 'database_mcp', class: DatabaseMCP },
      { name: 'web_search_mcp', class: WebSearchMCP }
    ];

    for (const tool of tools) {
      try {
        const instance = new tool.class();
        await instance.initialize();
        this.mcpTools.set(tool.name, instance);
        this.logger.info(`MCP Tool initialized: ${tool.name}`);
      } catch (error) {
        this.logger.error(`Failed to initialize MCP tool ${tool.name}:`, error);
      }
    }
  }

  async processRequest(requestData) {
    try {
      if (!this.isInitialized) {
        throw new Error('Orchestrator not initialized');
      }

      const startTime = Date.now();
      this.logger.info('Processing request', { requestId: requestData.requestId });

      // Check rate limiting
      const rateLimit = await this.redis.checkRateLimit(requestData.userId);
      if (!rateLimit.success || !rateLimit.allowed) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          rateLimit: rateLimit
        };
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(requestData);
      const cachedResult = await this.redis.get(cacheKey);
      
      if (cachedResult.success && cachedResult.cached) {
        this.logger.info('Cache hit', { requestId: requestData.requestId });
        return {
          success: true,
          data: cachedResult.data,
          cached: true,
          processingTime: Date.now() - startTime
        };
      }

      // Analyze intent and select tools
      const intent = this.analyzeIntent(requestData.message);
      const selectedTools = this.selectTools(intent, requestData);

      // Execute tools
      const toolResults = await this.executeTools(selectedTools, requestData);

      // Aggregate results
      const aggregatedResult = this.aggregateResults(toolResults, requestData);

      // Cache the result
      await this.redis.set(cacheKey, aggregatedResult, 3600); // 1 hour TTL

      // Update conversation history
      await this.updateConversationHistory(requestData, aggregatedResult);

      const processingTime = Date.now() - startTime;
      this.logger.info('Request processed successfully', { 
        requestId: requestData.requestId, 
        processingTime,
        toolsUsed: selectedTools.length
      });

      return {
        success: true,
        data: aggregatedResult,
        cached: false,
        processingTime,
        toolsUsed: selectedTools
      };

    } catch (error) {
      this.logger.error('Request processing failed:', error);
      return {
        success: false,
        error: error.message,
        requestId: requestData.requestId
      };
    }
  }

  analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Intent classification logic
    if (lowerMessage.includes('file') || lowerMessage.includes('read') || lowerMessage.includes('write')) {
      return 'file_operations';
    } else if (lowerMessage.includes('database') || lowerMessage.includes('query') || lowerMessage.includes('data')) {
      return 'database_operations';
    } else if (lowerMessage.includes('search') || lowerMessage.includes('web') || lowerMessage.includes('find')) {
      return 'web_search';
    } else if (lowerMessage.includes('code') || lowerMessage.includes('analyze') || lowerMessage.includes('optimize')) {
      return 'code_analysis';
    } else if (lowerMessage.includes('api') || lowerMessage.includes('http') || lowerMessage.includes('request')) {
      return 'api_integration';
    } else {
      return 'general_conversation';
    }
  }

  selectTools(intent, requestData) {
    const toolMap = {
      file_operations: ['filesystem_mcp'],
      database_operations: ['database_mcp'],
      web_search: ['web_search_mcp'],
      code_analysis: ['filesystem_mcp', 'code_analysis_mcp'],
      api_integration: ['api_integration_mcp'],
      general_conversation: ['llm_integration']
    };

    const tools = toolMap[intent] || ['llm_integration'];
    
    // Filter available tools
    return tools.filter(tool => this.mcpTools.has(tool));
  }

  async executeTools(selectedTools, requestData) {
    const results = [];

    for (const toolName of selectedTools) {
      try {
        const tool = this.mcpTools.get(toolName);
        if (!tool) {
          this.logger.warn(`Tool not found: ${toolName}`);
          continue;
        }

        // Check tool-specific cache
        const toolCacheKey = this.generateToolCacheKey(toolName, requestData);
        const cachedToolResult = await this.redis.getToolResult(toolName, toolCacheKey);
        
        if (cachedToolResult.success && cachedToolResult.cached) {
          results.push({
            tool: toolName,
            success: true,
            data: cachedToolResult.data,
            cached: true
          });
          continue;
        }

        // Execute tool
        const operation = this.determineToolOperation(toolName, requestData);
        const params = this.prepareToolParams(toolName, requestData);
        
        const result = await tool.execute(operation, params);
        
        // Cache tool result
        if (result.success) {
          await this.redis.setToolResult(toolName, toolCacheKey, result, 1800); // 30 minutes
        }

        results.push({
          tool: toolName,
          operation,
          ...result
        });

      } catch (error) {
        this.logger.error(`Tool execution failed for ${toolName}:`, error);
        results.push({
          tool: toolName,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  determineToolOperation(toolName, requestData) {
    const operationMap = {
      filesystem_mcp: 'analyze',
      database_mcp: 'query',
      web_search_mcp: 'search',
      code_analysis_mcp: 'analyze',
      api_integration_mcp: 'request'
    };

    return operationMap[toolName] || 'process';
  }

  prepareToolParams(toolName, requestData) {
    const baseParams = {
      message: requestData.message,
      sessionId: requestData.sessionId,
      userId: requestData.userId
    };

    switch (toolName) {
      case 'filesystem_mcp':
        return {
          ...baseParams,
          path: this.extractFilePath(requestData.message) || './',
          operation: 'analyze'
        };
      case 'database_mcp':
        return {
          ...baseParams,
          query: this.extractQuery(requestData.message),
          connectionId: requestData.connectionId
        };
      case 'web_search_mcp':
        return {
          ...baseParams,
          query: requestData.message,
          options: { maxResults: 5 }
        };
      default:
        return baseParams;
    }
  }

  extractFilePath(message) {
    // Simple file path extraction
    const fileMatch = message.match(/['"`]([^'"`]+\.(js|ts|py|json|md|txt))['"`]/);
    return fileMatch ? fileMatch[1] : null;
  }

  extractQuery(message) {
    // Simple query extraction
    if (message.toLowerCase().includes('select') || message.toLowerCase().includes('query')) {
      return message;
    }
    return null;
  }

  aggregateResults(toolResults, requestData) {
    const successfulResults = toolResults.filter(result => result.success);
    const failedResults = toolResults.filter(result => !result.success);

    const aggregated = {
      requestId: requestData.requestId,
      sessionId: requestData.sessionId,
      userId: requestData.userId,
      message: requestData.message,
      timestamp: new Date().toISOString(),
      results: successfulResults.map(result => ({
        tool: result.tool,
        data: result.data,
        cached: result.cached || false
      })),
      summary: this.generateSummary(successfulResults, requestData),
      errors: failedResults.map(result => ({
        tool: result.tool,
        error: result.error
      })),
      metadata: {
        totalTools: toolResults.length,
        successfulTools: successfulResults.length,
        failedTools: failedResults.length,
        toolsUsed: successfulResults.map(r => r.tool)
      }
    };

    return aggregated;
  }

  generateSummary(results, requestData) {
    if (results.length === 0) {
      return 'No tools were successfully executed.';
    }

    const toolNames = results.map(r => r.tool).join(', ');
    return `Successfully processed request using ${results.length} tool(s): ${toolNames}`;
  }

  async updateConversationHistory(requestData, result) {
    try {
      const message = {
        type: 'user',
        content: requestData.message,
        timestamp: new Date().toISOString()
      };

      const response = {
        type: 'assistant',
        content: result.summary,
        data: result,
        timestamp: new Date().toISOString()
      };

      await this.redis.appendToConversation(
        requestData.userId,
        requestData.conversationId,
        message
      );

      await this.redis.appendToConversation(
        requestData.userId,
        requestData.conversationId,
        response
      );

    } catch (error) {
      this.logger.error('Failed to update conversation history:', error);
    }
  }

  generateCacheKey(requestData) {
    const content = `${requestData.message}:${requestData.sessionId}:${requestData.userId}`;
    return crypto.createHash('md5').update(content).digest('hex');
  }

  generateToolCacheKey(toolName, requestData) {
    const content = `${toolName}:${requestData.message}:${requestData.sessionId}`;
    return crypto.createHash('md5').update(content).digest('hex');
  }

  async getConversationHistory(userId, conversationId) {
    try {
      const result = await this.redis.getConversation(userId, conversationId);
      return result;
    } catch (error) {
      this.logger.error('Failed to get conversation history:', error);
      return { success: false, error: error.message };
    }
  }

  async healthCheck() {
    try {
      const checks = {
        orchestrator: this.isInitialized,
        redis: await this.redis.healthCheck(),
        mcpTools: {}
      };

      // Check each MCP tool
      for (const [name, tool] of this.mcpTools) {
        checks.mcpTools[name] = {
          available: true,
          name: tool.name,
          version: tool.version
        };
      }

      const allHealthy = checks.orchestrator && 
                        checks.redis.success && 
                        Object.keys(checks.mcpTools).length > 0;

      return {
        success: allHealthy,
        checks,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async shutdown() {
    try {
      this.logger.info('Shutting down AI Agent Orchestrator');
      
      if (this.redis) {
        await this.redis.disconnect();
      }

      this.isInitialized = false;
      this.logger.info('Shutdown completed');
      
      return { success: true, message: 'Shutdown completed' };
    } catch (error) {
      this.logger.error('Shutdown failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = AIAgentOrchestrator;