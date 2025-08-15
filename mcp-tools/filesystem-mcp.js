const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class FileSystemMCP {
  constructor() {
    this.name = 'filesystem_mcp';
    this.description = 'File system operations and code analysis';
    this.version = '1.0.0';
  }

  async initialize() {
    console.log(`Initializing ${this.name} MCP tool`);
    return { success: true, message: 'File System MCP initialized' };
  }

  async readFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        data: {
          content,
          path: filePath,
          size: stats.size,
          modified: stats.mtime,
          type: path.extname(filePath)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async writeFile(filePath, content) {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf8');
      
      return {
        success: true,
        data: {
          path: filePath,
          message: 'File written successfully'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async listDirectory(dirPath) {
    try {
      const items = await fs.readdir(dirPath);
      const detailedItems = [];
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = await fs.stat(fullPath);
        
        detailedItems.push({
          name: item,
          path: fullPath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime
        });
      }
      
      return {
        success: true,
        data: {
          path: dirPath,
          items: detailedItems
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async analyzeCode(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const ext = path.extname(filePath);
      
      const analysis = {
        filePath,
        extension: ext,
        size: content.length,
        lines: content.split('\n').length,
        characters: content.length,
        complexity: this.calculateComplexity(content, ext),
        issues: this.detectIssues(content, ext)
      };
      
      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  calculateComplexity(content, ext) {
    let complexity = 0;
    
    // Basic complexity calculation
    const lines = content.split('\n');
    complexity += lines.length * 0.1; // Base complexity per line
    
    // Language-specific complexity
    if (ext === '.js' || ext === '.ts') {
      complexity += (content.match(/function|class|if|for|while/g) || []).length * 0.5;
      complexity += (content.match(/try|catch|finally/g) || []).length * 0.3;
    } else if (ext === '.py') {
      complexity += (content.match(/def|class|if|for|while/g) || []).length * 0.5;
      complexity += (content.match(/try|except|finally/g) || []).length * 0.3;
    }
    
    return Math.round(complexity * 100) / 100;
  }

  detectIssues(content, ext) {
    const issues = [];
    
    // Common code issues
    if (content.includes('TODO') || content.includes('FIXME')) {
      issues.push('Contains TODO/FIXME comments');
    }
    
    if (content.includes('console.log') && ext === '.js') {
      issues.push('Contains console.log statements (consider removing for production)');
    }
    
    if (content.includes('print(') && ext === '.py') {
      issues.push('Contains print statements (consider using logging)');
    }
    
    // Security issues
    if (content.includes('eval(') || content.includes('exec(')) {
      issues.push('Contains potentially dangerous eval/exec calls');
    }
    
    return issues;
  }

  async searchFiles(directory, pattern) {
    try {
      const results = [];
      
      const searchRecursive = async (dir) => {
        const items = await fs.readdir(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stats = await fs.stat(fullPath);
          
          if (stats.isDirectory()) {
            await searchRecursive(fullPath);
          } else if (item.includes(pattern) || fullPath.includes(pattern)) {
            results.push({
              name: item,
              path: fullPath,
              size: stats.size,
              modified: stats.mtime
            });
          }
        }
      };
      
      await searchRecursive(directory);
      
      return {
        success: true,
        data: {
          pattern,
          directory,
          results
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async execute(operation, params) {
    switch (operation) {
      case 'read':
        return await this.readFile(params.path);
      case 'write':
        return await this.writeFile(params.path, params.content);
      case 'list':
        return await this.listDirectory(params.path);
      case 'analyze':
        return await this.analyzeCode(params.path);
      case 'search':
        return await this.searchFiles(params.directory, params.pattern);
      default:
        return {
          success: false,
          error: `Unknown operation: ${operation}`
        };
    }
  }
}

module.exports = FileSystemMCP;