#!/bin/bash

# Advanced AI Agent in n8n with Redis & MCP Tools - Setup Script
# This script sets up the complete environment for the AI agent

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Docker
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js (optional for development)
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            print_warning "Node.js version is less than 18. Consider upgrading for development features."
        else
            print_success "Node.js $(node --version) detected"
        fi
    else
        print_warning "Node.js not found. Install Node.js 18+ for development features."
    fi
    
    # Check available ports
    PORTS=(5678 6379 3000 3001 3002 3003 3004 8081)
    for port in "${PORTS[@]}"; do
        if netstat -tuln 2>/dev/null | grep ":$port " >/dev/null; then
            print_warning "Port $port is already in use. Please free the port or modify docker-compose.yml"
        fi
    done
    
    print_success "System requirements check completed"
}

# Function to create directory structure
create_directories() {
    print_status "Creating directory structure..."
    
    # Create all necessary directories
    mkdir -p {workflows,docker/{n8n,redis,postgres,mcp-servers/{filesystem,database,web,code},nginx},config,scripts,monitoring/{dashboard,logs},docs,workspace,tmp}
    
    # Create MCP server subdirectories
    for server in filesystem database web code; do
        mkdir -p "docker/mcp-servers/$server/src"
    done
    
    print_success "Directory structure created"
}

# Function to copy configuration files
setup_configuration() {
    print_status "Setting up configuration files..."
    
    # Copy environment file if it doesn't exist
    if [ ! -f "config/n8n.env" ]; then
        if [ -f "config/n8n.env.example" ]; then
            cp config/n8n.env.example config/n8n.env
            print_success "Environment file created from example"
        else
            print_warning "Example environment file not found. Creating basic configuration..."
            cat > config/n8n.env << EOF
# n8n Configuration
N8N_USER=admin
N8N_PASSWORD=changeme123
N8N_HOST=localhost
N8N_PROTOCOL=http
WEBHOOK_URL=http://localhost:5678
TIMEZONE=UTC

# Database Configuration
POSTGRES_DB=n8n
POSTGRES_USER=n8n
POSTGRES_PASSWORD=n8n

# Redis Configuration
REDIS_PASSWORD=

# AI Model API Keys (Replace with your actual keys)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
EOF
        fi
    fi
    
    print_success "Configuration files setup completed"
}

# Function to create MCP server implementations
create_mcp_servers() {
    print_status "Creating MCP server implementations..."
    
    # Filesystem MCP Server
    cat > docker/mcp-servers/filesystem/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 3001

CMD ["node", "src/server.js"]
EOF

    cat > docker/mcp-servers/filesystem/package.json << 'EOF'
{
  "name": "mcp-filesystem-server",
  "version": "1.0.0",
  "description": "MCP Filesystem Server",
  "main": "src/server.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "fs-extra": "^11.1.1",
    "chokidar": "^3.5.3",
    "express-rate-limit": "^6.7.0"
  }
}
EOF

    # Database MCP Server
    cat > docker/mcp-servers/database/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 3002

CMD ["node", "src/server.js"]
EOF

    cat > docker/mcp-servers/database/package.json << 'EOF'
{
  "name": "mcp-database-server",
  "version": "1.0.0",
  "description": "MCP Database Server",
  "main": "src/server.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "pg": "^8.10.0",
    "mysql2": "^3.3.0",
    "sqlite3": "^5.1.6",
    "mongodb": "^5.5.0",
    "redis": "^4.6.6",
    "express-rate-limit": "^6.7.0"
  }
}
EOF

    # Web MCP Server
    cat > docker/mcp-servers/web/Dockerfile << 'EOF'
FROM node:18-alpine

RUN apk add --no-cache chromium

ENV CHROMIUM_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 3003

CMD ["node", "src/server.js"]
EOF

    cat > docker/mcp-servers/web/package.json << 'EOF'
{
  "name": "mcp-web-server",
  "version": "1.0.0",
  "description": "MCP Web Server",
  "main": "src/server.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.4.0",
    "cheerio": "^1.0.0-rc.12",
    "puppeteer": "^20.3.0",
    "robots-parser": "^3.0.1",
    "express-rate-limit": "^6.7.0"
  }
}
EOF

    # Code MCP Server
    cat > docker/mcp-servers/code/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 3004

CMD ["node", "src/server.js"]
EOF

    cat > docker/mcp-servers/code/package.json << 'EOF'
{
  "name": "mcp-code-server",
  "version": "1.0.0",
  "description": "MCP Code Server",
  "main": "src/server.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@babel/parser": "^7.22.5",
    "@babel/traverse": "^7.22.5",
    "esprima": "^4.0.1",
    "eslint": "^8.42.0",
    "prettier": "^2.8.8",
    "express-rate-limit": "^6.7.0"
  }
}
EOF

    print_success "MCP server implementations created"
}

# Function to create monitoring dashboard
create_monitoring() {
    print_status "Creating monitoring dashboard..."
    
    cat > monitoring/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY public/ ./public/

EXPOSE 3000

CMD ["node", "src/server.js"]
EOF

    cat > monitoring/package.json << 'EOF'
{
  "name": "n8n-ai-agent-monitoring",
  "version": "1.0.0",
  "description": "Monitoring Dashboard for n8n AI Agent",
  "main": "src/server.js",
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.2",
    "redis": "^4.6.6",
    "pg": "^8.10.0",
    "axios": "^1.4.0"
  }
}
EOF

    mkdir -p monitoring/src monitoring/public
    
    print_success "Monitoring dashboard structure created"
}

# Function to generate secure passwords
generate_passwords() {
    print_status "Generating secure passwords..."
    
    # Generate random passwords
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    N8N_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/")
    ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d "=+/")
    
    # Update environment file
    sed -i.bak \
        -e "s/POSTGRES_PASSWORD=n8n/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" \
        -e "s/REDIS_PASSWORD=/REDIS_PASSWORD=$REDIS_PASSWORD/" \
        -e "s/N8N_PASSWORD=changeme123/N8N_PASSWORD=$N8N_PASSWORD/" \
        -e "s/JWT_SECRET=your_jwt_secret_here/JWT_SECRET=$JWT_SECRET/" \
        -e "s/ENCRYPTION_KEY=your_encryption_key_here/ENCRYPTION_KEY=$ENCRYPTION_KEY/" \
        config/n8n.env
    
    print_success "Secure passwords generated and configured"
    print_warning "Please update your API keys in config/n8n.env before starting the services"
}

# Function to create helper scripts
create_helper_scripts() {
    print_status "Creating helper scripts..."
    
    # Create start script
    cat > scripts/start.sh << 'EOF'
#!/bin/bash
echo "Starting n8n AI Agent stack..."
docker-compose up -d
echo "Services started. Access points:"
echo "- n8n Interface: http://localhost:5678"
echo "- Redis Commander: http://localhost:8081"
echo "- Monitoring Dashboard: http://localhost:3000"
EOF

    # Create stop script
    cat > scripts/stop.sh << 'EOF'
#!/bin/bash
echo "Stopping n8n AI Agent stack..."
docker-compose down
echo "Services stopped."
EOF

    # Create logs script
    cat > scripts/logs.sh << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
    echo "Showing logs for all services..."
    docker-compose logs -f
else
    echo "Showing logs for service: $1"
    docker-compose logs -f "$1"
fi
EOF

    # Create backup script
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Creating backup in $BACKUP_DIR..."

# Backup volumes
docker run --rm -v n8n-ai-agent_n8n_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/n8n_data.tar.gz -C /data .
docker run --rm -v n8n-ai-agent_postgres_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .
docker run --rm -v n8n-ai-agent_redis_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/redis_data.tar.gz -C /data .

# Backup configuration
cp -r config "$BACKUP_DIR/"
cp -r workflows "$BACKUP_DIR/"

echo "Backup completed: $BACKUP_DIR"
EOF

    # Make scripts executable
    chmod +x scripts/*.sh
    
    print_success "Helper scripts created"
}

# Function to validate setup
validate_setup() {
    print_status "Validating setup..."
    
    # Check if all required files exist
    REQUIRED_FILES=(
        "docker/docker-compose.yml"
        "config/n8n.env"
        "config/redis.conf"
        "config/mcp-config.json"
        "workflows/main-agent.json"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    print_success "Setup validation completed"
}

# Function to display final instructions
show_final_instructions() {
    print_success "Setup completed successfully!"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Update your API keys in config/n8n.env"
    echo "2. Review and customize configuration files as needed"
    echo "3. Start the services: ./scripts/start.sh"
    echo "4. Access n8n at http://localhost:5678"
    echo ""
    echo -e "${BLUE}Useful commands:${NC}"
    echo "- Start services: ./scripts/start.sh"
    echo "- Stop services: ./scripts/stop.sh"
    echo "- View logs: ./scripts/logs.sh [service-name]"
    echo "- Create backup: ./scripts/backup.sh"
    echo ""
    echo -e "${YELLOW}Important:${NC}"
    echo "- Default n8n credentials: admin / (check config/n8n.env)"
    echo "- Update all default passwords before production use"
    echo "- Configure your AI model API keys in config/n8n.env"
}

# Main setup function
main() {
    echo -e "${GREEN}===============================================${NC}"
    echo -e "${GREEN}  Advanced AI Agent in n8n - Setup Script    ${NC}"
    echo -e "${GREEN}===============================================${NC}"
    echo ""
    
    check_requirements
    create_directories
    setup_configuration
    create_mcp_servers
    create_monitoring
    generate_passwords
    create_helper_scripts
    validate_setup
    show_final_instructions
}

# Run main function
main "$@"