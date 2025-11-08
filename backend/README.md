# RoadEye Backend

Golang-based backend API for the RoadEye road hazard detection system.

## Features

- **JWT Authentication** - Secure user authentication with refresh tokens
- **Geospatial Queries** - PostGIS-powered location-based hazard search
- **RESTful API** - Clean, well-documented endpoints
- **Redis Integration** - Caching and message queue support
- **Microservices Ready** - Modular architecture for scalability

## Tech Stack

- **Language**: Go 1.21+
- **Framework**: Chi router
- **Database**: PostgreSQL 15 with PostGIS
- **Cache/Queue**: Redis 7
- **Auth**: JWT with bcrypt password hashing

## Project Structure

```
backend/
├── cmd/
│   ├── api/          # Main API server
│   └── worker/       # Background worker
├── internal/
│   ├── auth/         # JWT & authentication
│   ├── db/           # Database connection
│   ├── handlers/     # HTTP handlers
│   └── hazards/      # Hazard repository
├── pkg/
│   └── models/       # Data models
├── migrations/       # SQL migrations
└── Dockerfile
```

## Getting Started

### Prerequisites

- Go 1.21 or higher
- PostgreSQL 15+ with PostGIS
- Redis 7+
- Make (optional)

### Installation

1. **Clone and navigate**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run migrations**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d db
   
   # Or manually with psql
   psql -U roadeye -d roadeye_db -f migrations/001_init_schema.sql
   psql -U roadeye -d roadeye_db -f migrations/002_seed_data.sql
   ```

5. **Run the server**
   ```bash
   make run
   # or
   go run cmd/api/main.go
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/profile` | Get user profile | Yes |

### Hazards

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/hazards/report` | Report new hazard | Yes |
| GET | `/hazards` | Get nearby hazards | Yes |
| GET | `/hazards/{id}` | Get hazard details | Yes |
| POST | `/hazards/{id}/verify` | Verify hazard | Yes |
| DELETE | `/hazards/{id}` | Delete hazard | Yes |

### Example Requests

**Register User**
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Login**
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Nearby Hazards**
```bash
curl -X GET "http://localhost:8080/hazards?lat=37.7749&lon=-122.4194&radius=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Report Hazard**
```bash
curl -X POST http://localhost:8080/hazards/report \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pothole",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "severity": "high",
    "description": "Large pothole on main street"
  }'
```

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `username` (VARCHAR) - Unique username
- `email` (VARCHAR) - Unique email
- `password_hash` (VARCHAR) - Bcrypt hashed password
- `points` (INTEGER) - Gamification points
- `avatar` (TEXT) - Avatar URL
- `created_at`, `updated_at` (TIMESTAMP)

### Hazards Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `type` (VARCHAR) - pothole, debris, accident, construction, other
- `latitude`, `longitude` (DOUBLE PRECISION)
- `location` (GEOGRAPHY) - PostGIS point (auto-generated)
- `image_url` (TEXT) - S3 URL
- `severity` (VARCHAR) - low, medium, high
- `description` (TEXT)
- `is_verified` (BOOLEAN)
- `verify_count` (INTEGER)
- `created_at`, `updated_at` (TIMESTAMP)

## Development

### Running Tests
```bash
make test
```

### Building
```bash
make build
```

### Docker Build
```bash
docker build -t roadeye-backend .
```

### Hot Reload (with Air)
```bash
# Install Air
go install github.com/cosmtrek/air@latest

# Run with hot reload
air
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8080 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USER` | Database user | roadeye |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | roadeye_db |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRY` | Token expiry duration | 24h |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `AI_SERVICE_URL` | AI service URL | http://localhost:8001 |

## Deployment

### Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Manual Deployment
1. Build the binary
2. Set environment variables
3. Run migrations
4. Start the server

### Cloud Deployment
- **AWS**: Use ECS or EC2 with RDS PostgreSQL
- **GCP**: Use Cloud Run with Cloud SQL
- **Render**: Use Web Service with managed PostgreSQL

## Security

- Passwords hashed with bcrypt (cost 12)
- JWT tokens with configurable expiry
- CORS enabled with configurable origins
- SQL injection protection via parameterized queries
- Input validation on all endpoints

## Performance

- Connection pooling (25 max open, 5 max idle)
- PostGIS spatial indexing for fast geospatial queries
- Redis caching for frequently accessed data
- Efficient database queries with proper indexes

## Monitoring

Add Prometheus metrics:
```go
// TODO: Implement metrics endpoint
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## License

MIT License
