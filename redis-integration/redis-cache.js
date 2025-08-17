const Redis = require('ioredis');
const crypto = require('crypto');

class RedisCache {
  constructor(config = {}) {
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password || null,
      db: config.db || 0,
      keyPrefix: config.keyPrefix || 'ai-agent:',
      defaultTTL: config.defaultTTL || 3600, // 1 hour
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };

    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = new Redis({
        host: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db,
        keyPrefix: this.config.keyPrefix,
        retryDelayOnFailover: this.config.retryDelay,
        maxRetriesPerRequest: this.config.maxRetries,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000
      });

      this.client.on('connect', () => {
        console.log('Redis connected');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('Redis error:', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('Redis connection closed');
        this.isConnected = false;
      });

      await this.client.connect();
      return { success: true, message: 'Redis connected successfully' };
    } catch (error) {
      console.error('Redis connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  generateKey(prefix, identifier) {
    const hash = crypto.createHash('md5').update(identifier).digest('hex');
    return `${prefix}:${hash}`;
  }

  async get(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const value = await this.client.get(key);
      if (value === null) {
        return { success: true, data: null, cached: false };
      }

      const parsed = JSON.parse(value);
      return { success: true, data: parsed, cached: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async set(key, value, ttl = null) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const serialized = JSON.stringify(value);
      const finalTTL = ttl || this.config.defaultTTL;

      await this.client.setex(key, finalTTL, serialized);
      return { success: true, message: 'Value cached successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async delete(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.del(key);
      return { success: true, deleted: result > 0 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.exists(key);
      return { success: true, exists: result > 0 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async expire(key, ttl) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.client.expire(key, ttl);
      return { success: true, expired: result > 0 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async ttl(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const ttl = await this.client.ttl(key);
      return { success: true, ttl };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Session Management
  async getSession(sessionId) {
    const key = this.generateKey('session', sessionId);
    return await this.get(key);
  }

  async setSession(sessionId, data, ttl = 86400) { // 24 hours
    const key = this.generateKey('session', sessionId);
    return await this.set(key, data, ttl);
  }

  async deleteSession(sessionId) {
    const key = this.generateKey('session', sessionId);
    return await this.delete(key);
  }

  // Tool Results Caching
  async getToolResult(toolName, requestHash) {
    const key = this.generateKey('tool', `${toolName}:${requestHash}`);
    return await this.get(key);
  }

  async setToolResult(toolName, requestHash, result, ttl = 1800) { // 30 minutes
    const key = this.generateKey('tool', `${toolName}:${requestHash}`);
    return await this.set(key, result, ttl);
  }

  // Conversation History
  async getConversation(userId, conversationId) {
    const key = this.generateKey('conversation', `${userId}:${conversationId}`);
    return await this.get(key);
  }

  async setConversation(userId, conversationId, messages, ttl = 604800) { // 7 days
    const key = this.generateKey('conversation', `${userId}:${conversationId}`);
    return await this.set(key, messages, ttl);
  }

  async appendToConversation(userId, conversationId, message) {
    const key = this.generateKey('conversation', `${userId}:${conversationId}`);
    
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const existing = await this.get(key);
      const messages = existing.data || [];
      messages.push({
        ...message,
        timestamp: new Date().toISOString()
      });

      return await this.set(key, messages, 604800);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Rate Limiting
  async checkRateLimit(userId, limit = 100, window = 3600) { // 100 requests per hour
    const key = this.generateKey('rate-limit', userId);
    
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const current = await this.client.incr(key);
      
      if (current === 1) {
        await this.client.expire(key, window);
      }

      const ttl = await this.client.ttl(key);
      
      return {
        success: true,
        allowed: current <= limit,
        current,
        limit,
        remaining: Math.max(0, limit - current),
        resetTime: ttl
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Configuration Caching
  async getConfig(agentId) {
    const key = this.generateKey('config', agentId);
    return await this.get(key);
  }

  async setConfig(agentId, config, ttl = 86400) { // 24 hours
    const key = this.generateKey('config', agentId);
    return await this.set(key, config, ttl);
  }

  // Cache Warming
  async warmCache(patterns) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const warmed = [];
      
      for (const pattern of patterns) {
        const keys = await this.client.keys(pattern);
        for (const key of keys) {
          const value = await this.client.get(key);
          if (value) {
            warmed.push({ key, size: value.length });
          }
        }
      }

      return { success: true, warmed };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Cache Statistics
  async getStats() {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const info = await this.client.info();
      const memory = await this.client.memory('USAGE');
      
      return {
        success: true,
        stats: {
          info: info.split('\r\n').reduce((acc, line) => {
            const [key, value] = line.split(':');
            if (key && value) acc[key] = value;
            return acc;
          }, {}),
          memory: parseInt(memory) || 0
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Cache Invalidation
  async invalidatePattern(pattern) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        const deleted = await this.client.del(...keys);
        return { success: true, deleted, keys: keys.length };
      }

      return { success: true, deleted: 0, keys: 0 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Health Check
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { success: false, error: 'Redis not connected' };
      }

      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;

      return {
        success: true,
        connected: this.isConnected,
        latency,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = RedisCache;