const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.MCP_SERVER_PORT || 3001;

// Configuration
const config = {
  allowedPaths: (process.env.ALLOWED_PATHS || '/workspace,/tmp').split(','),
  maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
  allowedExtensions: ['.txt', '.json', '.md', '.js', '.ts', '.py', '.yml', '.yaml', '.xml', '.csv'],
  enableWatching: process.env.ENABLE_WATCHING !== 'false',
  cacheResults: process.env.CACHE_RESULTS !== 'false',
  cacheTtl: parseInt(process.env.CACHE_TTL || '300')
};

// Middleware
app.use(cors());
app.use(express.json({ limit: config.maxFileSize }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Cache for file operations
const cache = new Map();

// File watchers
const watchers = new Map();

// Utility functions
function isPathAllowed(filePath) {
  const resolvedPath = path.resolve(filePath);
  return config.allowedPaths.some(allowedPath => {
    const resolvedAllowedPath = path.resolve(allowedPath);
    return resolvedPath.startsWith(resolvedAllowedPath);
  });
}

function isExtensionAllowed(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return config.allowedExtensions.includes(ext) || ext === '';
}

function getCacheKey(operation, filePath, params = {}) {
  return `${operation}:${filePath}:${JSON.stringify(params)}`;
}

function setCache(key, data, ttl = config.cacheTtl) {
  if (config.cacheResults) {
    cache.set(key, {
      data,
      expires: Date.now() + (ttl * 1000)
    });
  }
}

function getCache(key) {
  if (!config.cacheResults) return null;
  
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  if (cached) {
    cache.delete(key);
  }
  
  return null;
}

// MCP Tool Implementations
const tools = {
  async read_file(params) {
    const { path: filePath, encoding = 'utf8' } = params;
    
    if (!isPathAllowed(filePath)) {
      throw new Error('Access denied: Path not allowed');
    }
    
    const cacheKey = getCacheKey('read_file', filePath, { encoding });
    const cached = getCache(cacheKey);
    if (cached) {
      return { content: cached, cached: true };
    }
    
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      throw new Error('Path is not a file');
    }
    
    const content = await fs.readFile(filePath, encoding);
    setCache(cacheKey, content);
    
    return {
      content,
      size: stats.size,
      modified: stats.mtime,
      cached: false
    };
  },

  async write_file(params) {
    const { path: filePath, content, encoding = 'utf8', createDirs = true } = params;
    
    if (!isPathAllowed(filePath)) {
      throw new Error('Access denied: Path not allowed');
    }
    
    if (!isExtensionAllowed(filePath)) {
      throw new Error('File extension not allowed');
    }
    
    if (createDirs) {
      await fs.ensureDir(path.dirname(filePath));
    }
    
    await fs.writeFile(filePath, content, encoding);
    
    // Invalidate cache
    const cacheKey = getCacheKey('read_file', filePath);
    cache.delete(cacheKey);
    
    const stats = await fs.stat(filePath);
    return {
      success: true,
      size: stats.size,
      modified: stats.mtime
    };
  },

  async list_directory(params) {
    const { path: dirPath, recursive = false, includeStats = false } = params;
    
    if (!isPathAllowed(dirPath)) {
      throw new Error('Access denied: Path not allowed');
    }
    
    const cacheKey = getCacheKey('list_directory', dirPath, { recursive, includeStats });
    const cached = getCache(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
    
    const items = [];
    
    if (recursive) {
      const walk = async (currentPath) => {
        const entries = await fs.readdir(currentPath);
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry);
          const stats = await fs.stat(fullPath);
          
          const item = {
            name: entry,
            path: fullPath,
            relativePath: path.relative(dirPath, fullPath),
            type: stats.isDirectory() ? 'directory' : 'file'
          };
          
          if (includeStats) {
            item.stats = {
              size: stats.size,
              modified: stats.mtime,
              created: stats.birthtime,
              permissions: stats.mode
            };
          }
          
          items.push(item);
          
          if (stats.isDirectory()) {
            await walk(fullPath);
          }
        }
      };
      
      await walk(dirPath);
    } else {
      const entries = await fs.readdir(dirPath);
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const stats = await fs.stat(fullPath);
        
        const item = {
          name: entry,
          path: fullPath,
          type: stats.isDirectory() ? 'directory' : 'file'
        };
        
        if (includeStats) {
          item.stats = {
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime,
            permissions: stats.mode
          };
        }
        
        items.push(item);
      }
    }
    
    const result = { items, count: items.length };
    setCache(cacheKey, result);
    
    return { ...result, cached: false };
  },

  async create_directory(params) {
    const { path: dirPath, recursive = true } = params;
    
    if (!isPathAllowed(dirPath)) {
      throw new Error('Access denied: Path not allowed');
    }
    
    if (recursive) {
      await fs.ensureDir(dirPath);
    } else {
      await fs.mkdir(dirPath);
    }
    
    return { success: true, path: dirPath };
  },

  async delete_file(params) {
    const { path: filePath } = params;
    
    if (!isPathAllowed(filePath)) {
      throw new Error('Access denied: Path not allowed');
    }
    
    const stats = await fs.stat(filePath);
    await fs.remove(filePath);
    
    // Invalidate cache
    const cacheKeys = Array.from(cache.keys()).filter(key => key.includes(filePath));
    cacheKeys.forEach(key => cache.delete(key));
    
    return {
      success: true,
      deletedType: stats.isDirectory() ? 'directory' : 'file'
    };
  },

  async move_file(params) {
    const { source, destination } = params;
    
    if (!isPathAllowed(source) || !isPathAllowed(destination)) {
      throw new Error('Access denied: Path not allowed');
    }
    
    await fs.move(source, destination);
    
    // Invalidate cache
    const cacheKeys = Array.from(cache.keys()).filter(key => 
      key.includes(source) || key.includes(destination)
    );
    cacheKeys.forEach(key => cache.delete(key));
    
    return { success: true, source, destination };
  },

  async copy_file(params) {
    const { source, destination, overwrite = false } = params;
    
    if (!isPathAllowed(source) || !isPathAllowed(destination)) {
      throw new Error('Access denied: Path not allowed');
    }
    
    await fs.copy(source, destination, { overwrite });
    
    return { success: true, source, destination };
  },

  async get_file_stats(params) {
    const { path: filePath } = params;
    
    if (!isPathAllowed(filePath)) {
      throw new Error('Access denied: Path not allowed');
    }
    
    const stats = await fs.stat(filePath);
    
    return {
      path: filePath,
      type: stats.isDirectory() ? 'directory' : 'file',
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime,
      accessed: stats.atime,
      permissions: stats.mode,
      isReadable: (stats.mode & parseInt('444', 8)) !== 0,
      isWritable: (stats.mode & parseInt('222', 8)) !== 0,
      isExecutable: (stats.mode & parseInt('111', 8)) !== 0
    };
  },

  async search_files(params) {
    const { path: searchPath, pattern, type = 'both', caseSensitive = false } = params;
    
    if (!isPathAllowed(searchPath)) {
      throw new Error('Access denied: Path not allowed');
    }
    
    const results = [];
    const regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
    
    const walk = async (currentPath) => {
      const entries = await fs.readdir(currentPath);
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry);
        const stats = await fs.stat(fullPath);
        
        const shouldInclude = (
          (type === 'both') ||
          (type === 'file' && stats.isFile()) ||
          (type === 'directory' && stats.isDirectory())
        ) && regex.test(entry);
        
        if (shouldInclude) {
          results.push({
            name: entry,
            path: fullPath,
            type: stats.isDirectory() ? 'directory' : 'file',
            size: stats.size,
            modified: stats.mtime
          });
        }
        
        if (stats.isDirectory()) {
          await walk(fullPath);
        }
      }
    };
    
    await walk(searchPath);
    
    return { results, count: results.length };
  },

  async watch_directory(params) {
    const { path: watchPath, events = ['add', 'change', 'unlink'] } = params;
    
    if (!config.enableWatching) {
      throw new Error('Directory watching is disabled');
    }
    
    if (!isPathAllowed(watchPath)) {
      throw new Error('Access denied: Path not allowed');
    }
    
    if (watchers.has(watchPath)) {
      return { success: true, message: 'Already watching this directory' };
    }
    
    const watcher = chokidar.watch(watchPath, {
      persistent: true,
      ignoreInitial: true
    });
    
    const watcherInfo = {
      watcher,
      events: [],
      startTime: Date.now()
    };
    
    events.forEach(event => {
      watcher.on(event, (filePath) => {
        watcherInfo.events.push({
          type: event,
          path: filePath,
          timestamp: Date.now()
        });
        
        // Keep only last 100 events
        if (watcherInfo.events.length > 100) {
          watcherInfo.events = watcherInfo.events.slice(-100);
        }
      });
    });
    
    watchers.set(watchPath, watcherInfo);
    
    return { success: true, watchPath, events };
  }
};

// Auto-detect and execute appropriate tool
async function autoDetectAndExecute(context, aiResponse) {
  const combinedText = `${context} ${aiResponse}`.toLowerCase();
  
  // Simple pattern matching for tool detection
  if (combinedText.includes('read file') || combinedText.includes('load file')) {
    // Extract file path from context
    const pathMatch = context.match(/['""]([^'""]+\.[a-zA-Z0-9]+)['""]/) || 
                     context.match(/(\S+\.[a-zA-Z0-9]+)/);
    if (pathMatch) {
      return await tools.read_file({ path: pathMatch[1] });
    }
  }
  
  if (combinedText.includes('list directory') || combinedText.includes('list files')) {
    const pathMatch = context.match(/['""]([^'""]+)['""]/) || 
                     context.match(/(\S+)/);
    if (pathMatch) {
      return await tools.list_directory({ path: pathMatch[1] });
    }
  }
  
  return { message: 'No specific file operation detected' };
}

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MCP Filesystem Server',
    version: '1.0.0',
    uptime: process.uptime(),
    cache: {
      size: cache.size,
      enabled: config.cacheResults
    },
    watchers: {
      active: watchers.size,
      enabled: config.enableWatching
    }
  });
});

app.get('/capabilities', (req, res) => {
  res.json({
    tools: Object.keys(tools),
    config: {
      allowedPaths: config.allowedPaths,
      allowedExtensions: config.allowedExtensions,
      maxFileSize: config.maxFileSize,
      enableWatching: config.enableWatching,
      cacheResults: config.cacheResults
    }
  });
});

app.post('/execute', async (req, res) => {
  try {
    const { tool, action, context, ai_response, ...params } = req.body;
    
    let result;
    
    if (action === 'auto_detect') {
      result = await autoDetectAndExecute(context, ai_response);
    } else if (tools[action]) {
      result = await tools[action](params);
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
    
    res.json({
      success: true,
      result,
      tool: 'filesystem',
      action: action || 'auto_detect',
      execution_time: Date.now() - req.startTime
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      tool: 'filesystem',
      execution_time: Date.now() - req.startTime
    });
  }
});

// Middleware to track execution time
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Cleanup watchers on shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down filesystem server...');
  watchers.forEach(({ watcher }) => {
    watcher.close();
  });
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`MCP Filesystem Server running on port ${PORT}`);
  console.log(`Allowed paths: ${config.allowedPaths.join(', ')}`);
  console.log(`Caching enabled: ${config.cacheResults}`);
  console.log(`Watching enabled: ${config.enableWatching}`);
});