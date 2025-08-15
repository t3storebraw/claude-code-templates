# Deployment Guide

## Prerequisites

### System Requirements

**Minimum Requirements:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- Network: 100 Mbps

**Recommended Requirements:**
- CPU: 8 cores
- RAM: 16GB
- Storage: 100GB NVMe SSD
- Network: 1 Gbps

### Software Dependencies

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for development)
- Git 2.30+

## Quick Start Deployment

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd n8n-ai-agent

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Configure Environment

```bash
# Copy and edit the environment file
cp config/n8n.env.example config/n8n.env
nano config/n8n.env
```

**Required Configuration:**
- Set your AI model API keys (OpenAI, Anthropic, etc.)
- Configure database passwords
- Set Redis password (if desired)
- Update webhook URLs for production

### 3. Start Services

```bash
# Start all services
./scripts/start.sh

# Or manually with Docker Compose
cd docker && docker-compose up -d
```

### 4. Verify Deployment

```bash
# Run the test suite
./scripts/test.sh

# Check individual services
curl http://localhost:5678/healthz  # n8n
curl http://localhost:3001/health   # MCP Filesystem
curl http://localhost:6379          # Redis (use redis-cli ping)
```

## Production Deployment

### 1. Environment Preparation

#### Using Docker Swarm

```bash
# Initialize Docker Swarm
docker swarm init

# Deploy the stack
docker stack deploy -c docker/docker-compose.prod.yml n8n-ai-agent
```

#### Using Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmaps.yaml
kubectl apply -f k8s/deployments.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/ingress.yaml
```

### 2. Load Balancer Configuration

#### Nginx Configuration

```nginx
upstream n8n_backend {
    server n8n-1:5678;
    server n8n-2:5678;
    server n8n-3:5678;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://n8n_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### HAProxy Configuration

```haproxy
global
    daemon
    maxconn 4096

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend n8n_frontend
    bind *:80
    default_backend n8n_servers

backend n8n_servers
    balance roundrobin
    server n8n-1 n8n-1:5678 check
    server n8n-2 n8n-2:5678 check
    server n8n-3 n8n-3:5678 check
```

### 3. SSL/TLS Configuration

#### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Manual SSL Certificate

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    location / {
        proxy_pass http://n8n_backend;
        # ... proxy headers
    }
}
```

## Database Setup

### PostgreSQL Configuration

#### Standalone PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE n8n;
CREATE USER n8n_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n_user;
```

#### PostgreSQL with Replication

```bash
# Master configuration (postgresql.conf)
wal_level = replica
max_wal_senders = 3
wal_keep_segments = 64

# Create replication user
CREATE USER replicator REPLICATION LOGIN CONNECTION LIMIT 1 ENCRYPTED PASSWORD 'secure_password';

# Slave configuration
standby_mode = 'on'
primary_conninfo = 'host=master-ip port=5432 user=replicator password=secure_password'
```

### Redis Configuration

#### Redis Cluster Setup

```bash
# Create Redis cluster configuration
redis-cli --cluster create \
  redis-1:6379 redis-2:6379 redis-3:6379 \
  redis-4:6379 redis-5:6379 redis-6:6379 \
  --cluster-replicas 1
```

#### Redis Sentinel for High Availability

```bash
# Sentinel configuration
port 26379
sentinel monitor mymaster redis-master 6379 2
sentinel auth-pass mymaster your_redis_password
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 10000
```

## Monitoring and Logging

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n:5678']
  
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
  
  - job_name: 'mcp-servers'
    static_configs:
      - targets: 
          - 'mcp-filesystem:3001'
          - 'mcp-database:3002'
          - 'mcp-web:3003'
          - 'mcp-code:3004'
```

### Grafana Dashboard Setup

```bash
# Import pre-configured dashboards
curl -X POST \
  http://admin:admin@grafana:3000/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -d @monitoring/grafana/n8n-dashboard.json
```

### ELK Stack for Logging

```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    
  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    
  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
```

## Security Hardening

### Network Security

```bash
# Configure firewall
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 5678/tcp   # Block direct n8n access
sudo ufw deny 6379/tcp   # Block direct Redis access
```

### Application Security

#### Environment Variables Encryption

```bash
# Use Docker secrets for sensitive data
echo "your_openai_api_key" | docker secret create openai_api_key -
echo "your_database_password" | docker secret create db_password -
```

#### Container Security

```dockerfile
# Use non-root user in containers
RUN addgroup -g 1001 -S appuser && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G appuser -g appuser appuser
USER appuser
```

### Access Control

#### OAuth2 Integration

```javascript
// n8n OAuth2 configuration
{
  "security": {
    "basicAuth": {
      "active": false
    },
    "oauth2": {
      "active": true,
      "clientId": "your-oauth2-client-id",
      "clientSecret": "your-oauth2-client-secret",
      "authorizeUrl": "https://your-oauth-provider.com/oauth/authorize",
      "tokenUrl": "https://your-oauth-provider.com/oauth/token"
    }
  }
}
```

## Backup and Recovery

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL
pg_dump -h postgres -U n8n_user n8n > "$BACKUP_DIR/n8n_database.sql"

# Backup Redis
redis-cli -h redis --rdb "$BACKUP_DIR/redis_dump.rdb"

# Backup n8n data volume
docker run --rm -v n8n_data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/n8n_data.tar.gz -C /data .

# Backup configuration
cp -r config "$BACKUP_DIR/"
cp -r workflows "$BACKUP_DIR/"

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR" s3://your-backup-bucket/n8n-ai-agent/ --recursive

echo "Backup completed: $BACKUP_DIR"
```

### Recovery Procedures

```bash
#!/bin/bash
# restore.sh

BACKUP_DIR="$1"

if [ -z "$BACKUP_DIR" ]; then
    echo "Usage: $0 <backup_directory>"
    exit 1
fi

# Stop services
docker-compose down

# Restore PostgreSQL
psql -h postgres -U n8n_user n8n < "$BACKUP_DIR/n8n_database.sql"

# Restore Redis
redis-cli -h redis --rdb < "$BACKUP_DIR/redis_dump.rdb"

# Restore n8n data
docker run --rm -v n8n_data:/data -v "$BACKUP_DIR":/backup alpine tar xzf /backup/n8n_data.tar.gz -C /data

# Restore configuration
cp -r "$BACKUP_DIR/config" .
cp -r "$BACKUP_DIR/workflows" .

# Start services
docker-compose up -d

echo "Recovery completed from: $BACKUP_DIR"
```

## Performance Optimization

### Database Optimization

```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_execution_data_execution_id ON execution_entity(execution_id);
CREATE INDEX CONCURRENTLY idx_workflow_entity_active ON workflow_entity(active);
```

### Redis Optimization

```conf
# redis.conf optimizations
maxmemory 1gb
maxmemory-policy allkeys-lru
tcp-keepalive 60
timeout 300

# Persistence optimization
save 900 1
save 300 10
save 60 10000
```

### Application Optimization

```yaml
# n8n performance configuration
environment:
  - EXECUTIONS_PROCESS=main
  - EXECUTIONS_MODE=queue
  - QUEUE_BULL_REDIS_HOST=redis
  - QUEUE_BULL_REDIS_PORT=6379
  - N8N_PAYLOAD_SIZE_MAX=64MB
  - N8N_BINARY_DATA_TTL=24
```

## Scaling Strategies

### Horizontal Scaling

#### n8n Worker Nodes

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  n8n-main:
    image: n8nio/n8n
    environment:
      - EXECUTIONS_PROCESS=main
      - EXECUTIONS_MODE=queue
    
  n8n-worker:
    image: n8nio/n8n
    command: worker
    environment:
      - EXECUTIONS_PROCESS=own
      - EXECUTIONS_MODE=queue
    deploy:
      replicas: 3
```

#### MCP Server Scaling

```bash
# Scale MCP servers independently
docker-compose up -d --scale mcp-filesystem=3
docker-compose up -d --scale mcp-web=2
docker-compose up -d --scale mcp-database=2
```

### Auto-scaling with Kubernetes

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: n8n-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: n8n-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Troubleshooting

### Common Issues

#### n8n Won't Start

```bash
# Check logs
docker-compose logs n8n

# Common solutions
# 1. Check database connectivity
docker-compose exec n8n ping postgres

# 2. Verify environment variables
docker-compose exec n8n env | grep N8N

# 3. Reset database
docker-compose exec postgres psql -U n8n_user -d n8n -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

#### MCP Servers Not Responding

```bash
# Check MCP server health
for port in 3001 3002 3003 3004; do
  curl -s "http://localhost:$port/health" || echo "Port $port not responding"
done

# Restart specific MCP server
docker-compose restart mcp-filesystem
```

#### Redis Connection Issues

```bash
# Test Redis connectivity
redis-cli -h redis ping

# Check Redis memory usage
redis-cli -h redis info memory

# Clear Redis cache if needed
redis-cli -h redis flushall
```

### Performance Issues

#### High CPU Usage

```bash
# Monitor container resource usage
docker stats

# Check n8n execution queue
curl -s http://localhost:5678/rest/executions | jq '.data[] | select(.finished == false)'

# Scale workers if needed
docker-compose up -d --scale n8n-worker=5
```

#### Memory Leaks

```bash
# Monitor memory usage
docker exec n8n node -e "console.log(process.memoryUsage())"

# Restart services if memory usage is high
docker-compose restart n8n
```

## Maintenance

### Regular Maintenance Tasks

```bash
#!/bin/bash
# maintenance.sh

# Update Docker images
docker-compose pull
docker-compose up -d

# Clean up old containers and images
docker system prune -f

# Backup data
./scripts/backup.sh

# Check disk space
df -h

# Monitor log sizes
du -sh /var/lib/docker/containers/*/
```

### Health Checks

```bash
#!/bin/bash
# health-check.sh

# Check all services
./scripts/test.sh monitoring

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "WARNING: Disk usage is $DISK_USAGE%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f\n", $3*100/$2}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "WARNING: Memory usage is $MEMORY_USAGE%"
fi
```

This deployment guide provides comprehensive instructions for deploying the Advanced AI Agent system in various environments, from development to production-scale deployments.