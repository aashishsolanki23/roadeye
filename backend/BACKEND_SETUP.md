# RoadEye Backend Setup Guide

Complete setup guide for the RoadEye backend and AI microservices.

## Quick Start

```bash
# Start all services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

Access services:
- **Backend API**: http://localhost:8080
- **AI Service**: http://localhost:8001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **pgAdmin** (dev): http://localhost:5050

## Detailed Setup

### 1. Prerequisites

**Required:**
- Docker & Docker Compose
- Git

**For local development:**
- Go 1.21+
- Python 3.11+
- PostgreSQL 15+ with PostGIS
- Redis 7+

### 2. Clone and Configure

```bash
# Navigate to project root
cd roadeye

# Copy environment file
cp backend/.env.example backend/.env

# Edit configuration
nano backend/.env
```

**Important environment variables:**
```env
JWT_SECRET=your-super-secret-key-change-this
DB_PASSWORD=secure-password-here
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
FCM_SERVER_KEY=your-firebase-key
```

### 3. Start Services

**Option A: Docker Compose (Recommended)**

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d db redis

# Start with build
docker-compose up --build -d
```

**Option B: Local Development**

```bash
# Terminal 1: Start PostgreSQL & Redis
docker-compose up -d db redis

# Terminal 2: Start Backend
cd backend
go mod download
go run cmd/api/main.go

# Terminal 3: Start AI Service
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001

# Terminal 4: Start Worker (optional)
cd backend
go run cmd/worker/main.go
```

### 4. Database Setup

**Automatic (with Docker Compose):**
Migrations run automatically on first start.

**Manual:**
```bash
# Connect to database
docker exec -it roadeye_db psql -U roadeye -d roadeye_db

# Or use psql locally
psql -h localhost -U roadeye -d roadeye_db

# Run migrations
\i /docker-entrypoint-initdb.d/001_init_schema.sql
\i /docker-entrypoint-initdb.d/002_seed_data.sql

# Verify
\dt  # List tables
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM hazards;
```

### 5. Verify Installation

**Check Backend API:**
```bash
curl http://localhost:8080/health
# Expected: OK

# Test registration
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Check AI Service:**
```bash
curl http://localhost:8001/health
# Expected: {"status":"healthy","model_loaded":true}
```

**Check Database:**
```bash
docker exec roadeye_db pg_isready -U roadeye
# Expected: accepting connections
```

**Check Redis:**
```bash
docker exec roadeye_redis redis-cli ping
# Expected: PONG
```

### 6. Test End-to-End

```bash
# 1. Register user
TOKEN=$(curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "password123"
  }' | jq -r '.token')

# 2. Get nearby hazards
curl -X GET "http://localhost:8080/hazards?lat=37.7749&lon=-122.4194&radius=10" \
  -H "Authorization: Bearer $TOKEN"

# 3. Report hazard
curl -X POST http://localhost:8080/hazards/report \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pothole",
    "latitude": 37.7750,
    "longitude": -122.4195,
    "severity": "high",
    "description": "Test hazard"
  }'
```

## Development Workflow

### Backend Development

```bash
cd backend

# Install Air for hot reload
go install github.com/cosmtrek/air@latest

# Run with hot reload
air

# Run tests
go test ./...

# Format code
go fmt ./...

# Build
make build
```

### AI Service Development

```bash
cd ai-service

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn app:app --reload --port 8001

# Test detection endpoint
python -c "
import requests
import base64

# Read test image
with open('test_image.jpg', 'rb') as f:
    img_b64 = base64.b64encode(f.read()).decode()

# Send detection request
response = requests.post('http://localhost:8001/detect', json={
    'imageBase64': img_b64,
    'latitude': 37.7749,
    'longitude': -122.4194
})

print(response.json())
"
```

### Database Management

**Using pgAdmin:**
1. Open http://localhost:5050
2. Login: admin@roadeye.com / admin
3. Add server:
   - Host: db
   - Port: 5432
   - Database: roadeye_db
   - Username: roadeye
   - Password: roadeye_password

**Using psql:**
```bash
# Connect
docker exec -it roadeye_db psql -U roadeye -d roadeye_db

# Useful queries
SELECT * FROM users LIMIT 10;
SELECT type, COUNT(*) FROM hazards GROUP BY type;

# Geospatial query
SELECT id, type, ST_AsText(location) 
FROM hazards 
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
  5000  -- 5km radius
);
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready
docker-compose restart backend

# 2. Port already in use
lsof -i :8080  # Find process
kill -9 <PID>  # Kill it

# 3. Module errors
cd backend
go mod tidy
go mod download
```

### AI Service errors

```bash
# Check logs
docker-compose logs ai-service

# Common issues:
# 1. Model not downloaded
docker exec -it roadeye_ai python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"

# 2. Memory issues (increase Docker memory)
# Docker Desktop > Settings > Resources > Memory: 4GB+

# 3. Python dependencies
docker-compose build --no-cache ai-service
```

### Database connection issues

```bash
# Check if PostgreSQL is running
docker-compose ps db

# Check logs
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up -d db

# Wait for healthy status
docker-compose ps
```

### Redis connection issues

```bash
# Check Redis
docker exec roadeye_redis redis-cli ping

# Clear Redis cache
docker exec roadeye_redis redis-cli FLUSHALL

# Restart Redis
docker-compose restart redis
```

## Production Deployment

### Environment Setup

```bash
# Set production environment variables
export ENV=production
export JWT_SECRET=$(openssl rand -base64 32)
export DB_PASSWORD=$(openssl rand -base64 24)
```

### Docker Deployment

```bash
# Build for production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

### Cloud Deployment

**AWS ECS:**
1. Push images to ECR
2. Create ECS task definitions
3. Configure load balancer
4. Set up RDS PostgreSQL with PostGIS
5. Configure ElastiCache Redis

**Google Cloud Run:**
1. Build and push to GCR
2. Deploy services
3. Configure Cloud SQL PostgreSQL
4. Set up Memorystore Redis

**Render:**
1. Connect GitHub repository
2. Create Web Services for backend and AI
3. Create PostgreSQL database
4. Create Redis instance
5. Configure environment variables

### SSL/TLS

```bash
# Using Let's Encrypt with Caddy
# Add to docker-compose.yml:
caddy:
  image: caddy:2-alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile
    - caddy_data:/data
```

## Monitoring & Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Health Checks

```bash
# Backend
curl http://localhost:8080/health

# AI Service
curl http://localhost:8001/health

# Database
docker exec roadeye_db pg_isready

# Redis
docker exec roadeye_redis redis-cli ping
```

### Performance Monitoring

Add Prometheus and Grafana:
```yaml
# docker-compose.monitoring.yml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3000:3000"
```

## Backup & Recovery

### Database Backup

```bash
# Backup
docker exec roadeye_db pg_dump -U roadeye roadeye_db > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i roadeye_db psql -U roadeye roadeye_db < backup_20240127.sql
```

### Redis Backup

```bash
# Backup
docker exec roadeye_redis redis-cli SAVE
docker cp roadeye_redis:/data/dump.rdb ./redis_backup.rdb

# Restore
docker cp ./redis_backup.rdb roadeye_redis:/data/dump.rdb
docker-compose restart redis
```

## Security Checklist

- [ ] Change default passwords
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS in production
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable database SSL
- [ ] Rotate credentials regularly
- [ ] Monitor for vulnerabilities
- [ ] Set up backup strategy
- [ ] Configure CORS properly

## Next Steps

1. **Configure FCM** for push notifications
2. **Set up S3** for image storage
3. **Add monitoring** with Prometheus/Grafana
4. **Implement rate limiting**
5. **Add API documentation** with Swagger
6. **Set up CI/CD** pipeline
7. **Configure CDN** for image delivery
8. **Add integration tests**

## Support

For issues:
- Check logs: `docker-compose logs`
- Review documentation
- Open GitHub issue
- Contact: support@roadeye.com
