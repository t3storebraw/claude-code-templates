#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class SetupScript {
  constructor() {
    this.projectRoot = process.cwd();
    this.logsDir = path.join(this.projectRoot, 'logs');
    this.configDir = path.join(this.projectRoot, 'config');
  }

  async run() {
    console.log(chalk.blue('🚀 Setting up Advanced AI Agent in n8n with Redis & MCP Tools'));
    console.log(chalk.gray('==================================================\n'));

    try {
      await this.createDirectories();
      await this.installDependencies();
      await this.setupRedis();
      await this.setupN8n();
      await this.createConfigurationFiles();
      await this.setupLogging();
      await this.runHealthCheck();
      
      console.log(chalk.green('\n✅ Setup completed successfully!'));
      console.log(chalk.yellow('\n📋 Next steps:'));
      console.log(chalk.white('1. Start Redis: redis-server'));
      console.log(chalk.white('2. Start n8n: npm run n8n:start'));
      console.log(chalk.white('3. Import workflow: n8n-workflows/advanced-ai-agent.json'));
      console.log(chalk.white('4. Test the agent: npm run test'));
      
    } catch (error) {
      console.error(chalk.red('\n❌ Setup failed:'), error.message);
      process.exit(1);
    }
  }

  async createDirectories() {
    console.log(chalk.blue('📁 Creating directories...'));
    
    const directories = [
      'logs',
      'config',
      'data',
      'cache',
      'temp',
      'backups'
    ];

    for (const dir of directories) {
      const dirPath = path.join(this.projectRoot, dir);
      await fs.ensureDir(dirPath);
      console.log(chalk.gray(`  ✓ Created ${dir}/`));
    }
  }

  async installDependencies() {
    console.log(chalk.blue('\n📦 Installing dependencies...'));
    
    try {
      // Check if package.json exists
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      if (!await fs.pathExists(packageJsonPath)) {
        throw new Error('package.json not found. Please run this script from the project root.');
      }

      // Install npm dependencies
      console.log(chalk.gray('  Installing npm packages...'));
      execSync('npm install', { stdio: 'inherit', cwd: this.projectRoot });
      
      console.log(chalk.green('  ✓ Dependencies installed successfully'));
    } catch (error) {
      console.error(chalk.red('  ✗ Failed to install dependencies:'), error.message);
      throw error;
    }
  }

  async setupRedis() {
    console.log(chalk.blue('\n🔴 Setting up Redis...'));
    
    try {
      // Check if Redis is installed
      try {
        execSync('redis-server --version', { stdio: 'pipe' });
        console.log(chalk.green('  ✓ Redis is installed'));
      } catch (error) {
        console.log(chalk.yellow('  ⚠ Redis not found. Please install Redis:'));
        console.log(chalk.gray('    Ubuntu/Debian: sudo apt-get install redis-server'));
        console.log(chalk.gray('    macOS: brew install redis'));
        console.log(chalk.gray('    Windows: Download from https://redis.io/download'));
      }

      // Create Redis configuration
      const redisConfig = {
        host: 'localhost',
        port: 6379,
        password: null,
        db: 0,
        keyPrefix: 'ai-agent:',
        defaultTTL: 3600
      };

      const configPath = path.join(this.configDir, 'redis.json');
      await fs.writeJson(configPath, redisConfig, { spaces: 2 });
      console.log(chalk.green('  ✓ Redis configuration created'));
      
    } catch (error) {
      console.error(chalk.red('  ✗ Redis setup failed:'), error.message);
      throw error;
    }
  }

  async setupN8n() {
    console.log(chalk.blue('\n🔧 Setting up n8n...'));
    
    try {
      // Check if n8n is installed globally
      try {
        execSync('n8n --version', { stdio: 'pipe' });
        console.log(chalk.green('  ✓ n8n is installed'));
      } catch (error) {
        console.log(chalk.yellow('  ⚠ Installing n8n globally...'));
        execSync('npm install -g n8n', { stdio: 'inherit' });
      }

      // Create n8n configuration
      const n8nConfig = {
        webhookUrl: 'http://localhost:5678/webhook/ai-agent',
        apiKey: process.env.N8N_API_KEY || 'your-n8n-api-key',
        port: 5678,
        host: 'localhost'
      };

      const configPath = path.join(this.configDir, 'n8n.json');
      await fs.writeJson(configPath, n8nConfig, { spaces: 2 });
      console.log(chalk.green('  ✓ n8n configuration created'));
      
    } catch (error) {
      console.error(chalk.red('  ✗ n8n setup failed:'), error.message);
      throw error;
    }
  }

  async createConfigurationFiles() {
    console.log(chalk.blue('\n⚙️ Creating configuration files...'));
    
    try {
      // Environment variables
      const envContent = `# AI Agent Environment Variables
NODE_ENV=development
PORT=3000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# n8n Configuration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/ai-agent
N8N_API_KEY=your-n8n-api-key

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
JWT_SECRET=your-jwt-secret-key
API_KEY=your-api-key

# MCP Tools
MCP_FILESYSTEM_ENABLED=true
MCP_DATABASE_ENABLED=true
MCP_WEBSEARCH_ENABLED=true
MCP_CODEANALYSIS_ENABLED=true
`;

      await fs.writeFile(path.join(this.projectRoot, '.env.example'), envContent);
      console.log(chalk.green('  ✓ Environment variables template created'));

      // Docker Compose for development
      const dockerComposeContent = `version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - n8n_data:/home/node/.n8n

  ai-agent:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data

volumes:
  redis_data:
  n8n_data:
`;

      await fs.writeFile(path.join(this.projectRoot, 'docker-compose.yml'), dockerComposeContent);
      console.log(chalk.green('  ✓ Docker Compose file created'));

      // Dockerfile
      const dockerfileContent = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p logs data cache temp backups

EXPOSE 3000

CMD ["npm", "start"]
`;

      await fs.writeFile(path.join(this.projectRoot, 'Dockerfile'), dockerfileContent);
      console.log(chalk.green('  ✓ Dockerfile created'));
      
    } catch (error) {
      console.error(chalk.red('  ✗ Configuration creation failed:'), error.message);
      throw error;
    }
  }

  async setupLogging() {
    console.log(chalk.blue('\n📝 Setting up logging...'));
    
    try {
      // Create log files
      const logFiles = [
        'logs/app.log',
        'logs/error.log',
        'logs/combined.log',
        'logs/access.log'
      ];

      for (const logFile of logFiles) {
        await fs.ensureFile(path.join(this.projectRoot, logFile));
      }

      console.log(chalk.green('  ✓ Log files created'));
      
    } catch (error) {
      console.error(chalk.red('  ✗ Logging setup failed:'), error.message);
      throw error;
    }
  }

  async runHealthCheck() {
    console.log(chalk.blue('\n🏥 Running health check...'));
    
    try {
      // Check if all required files exist
      const requiredFiles = [
        'package.json',
        'src/ai-agent-orchestrator.js',
        'redis-integration/redis-cache.js',
        'mcp-tools/filesystem-mcp.js',
        'mcp-tools/database-mcp.js',
        'mcp-tools/web-search-mcp.js',
        'n8n-workflows/advanced-ai-agent.json'
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(this.projectRoot, file);
        if (await fs.pathExists(filePath)) {
          console.log(chalk.green(`  ✓ ${file}`));
        } else {
          console.log(chalk.red(`  ✗ ${file} (missing)`));
        }
      }

      // Check if directories exist
      const requiredDirs = [
        'logs',
        'config',
        'data',
        'cache',
        'temp',
        'backups'
      ];

      for (const dir of requiredDirs) {
        const dirPath = path.join(this.projectRoot, dir);
        if (await fs.pathExists(dirPath)) {
          console.log(chalk.green(`  ✓ ${dir}/`));
        } else {
          console.log(chalk.red(`  ✗ ${dir}/ (missing)`));
        }
      }

      console.log(chalk.green('  ✓ Health check completed'));
      
    } catch (error) {
      console.error(chalk.red('  ✗ Health check failed:'), error.message);
      throw error;
    }
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  const setup = new SetupScript();
  setup.run().catch(error => {
    console.error(chalk.red('Setup failed:'), error);
    process.exit(1);
  });
}

module.exports = SetupScript;