# RoadEye - Complete Road Hazard Detection System

A full-stack real-time road hazard detection and alerting system with React Native mobile app, Golang backend, and Python AI microservice.

## 🎯 Project Overview

RoadEye helps drivers identify and avoid road hazards (potholes, debris, accidents, construction) using:
- **Mobile camera detection** with ML-powered hazard recognition
- **Crowd-sourced reporting** from community drivers
- **Real-time geospatial alerts** based on user location
- **Push notifications** for nearby hazards

## 📁 Project Structure

```
roadeye/
├── src/                      # React Native Frontend
│   ├── screens/              # Main app screens
│   ├── components/           # Reusable UI components
│   ├── store/                # Zustand state management
│   ├── api/                  # API client
│   └── utils/                # Utilities
├── backend/                  # Golang Backend API
│   ├── cmd/
│   │   ├── api/              # Main API server
│   │   └── worker/           # Background worker
│   ├── internal/
│   │   ├── auth/             # JWT authentication
│   │   ├── handlers/         # HTTP handlers
│   │   ├── hazards/          # Hazard repository
│   │   └── db/               # Database connection
│   ├── pkg/models/           # Data models
│   └── migrations/           # SQL migrations
├── ai-service/               # Python AI Service
│   ├── app.py                # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # AI service container
├── docker-compose.yml        # Service orchestration
├── App.tsx                   # Mobile app entry point
└── package.json              # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (recommended)
- **Node.js 16+** (for frontend)
- **Go 1.21+** (for backend development)
- **Python 3.11+** (for AI service development)

### Start All Services

```bash
# 1. Start backend services
docker-compose up -d

# 2. Install frontend dependencies
npm install

# 3. Start mobile app
npm start
```

Access:
- **Mobile App**: Scan QR code with Expo Go
- **Backend API**: http://localhost:8080
- **AI Service**: http://localhost:8001
- **Database**: localhost:5432
- **pgAdmin**: http://localhost:5050 (dev)

## 📱 Frontend (React Native + Expo)

### Features
- **Map View** - Live hazard markers with PostGIS geospatial queries
- **Camera Detection** - ML-powered hazard detection
- **Alerts List** - Nearby hazards sorted by distance
- **User Profile** - Stats, settings, and gamification

### Tech Stack
- React Native (Expo)
- TypeScript
- Zustand (state management)
- React Navigation
- React Native Maps
- Expo Camera, Location, Notifications

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

See [SETUP.md](SETUP.md) for detailed frontend setup.

## 🔧 Backend (Golang)

### Features
- **RESTful API** with Chi router
- **JWT Authentication** with refresh tokens
- **PostGIS Geospatial** queries for nearby hazards
- **Redis** caching and message queue
- **Background Worker** for async tasks

### Tech Stack
- Go 1.21
- PostgreSQL 15 + PostGIS
- Redis 7
- Chi router
- JWT authentication

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login user |
| GET | `/auth/profile` | Get profile |
| POST | `/hazards/report` | Report hazard |
| GET | `/hazards` | Get nearby hazards |
| GET | `/hazards/{id}` | Get hazard details |
| POST | `/hazards/{id}/verify` | Verify hazard |

### Setup
```bash
cd backend

# Install dependencies
go mod download

# Run migrations
docker-compose up -d db
psql -U roadeye -d roadeye_db -f migrations/001_init_schema.sql

# Start server
go run cmd/api/main.go
```

See [backend/README.md](backend/README.md) for detailed backend setup.

## 🤖 AI Service (Python + YOLOv8)

### Features
- **YOLOv8 Detection** for road hazards
- **Privacy Protection** - Auto-blur faces and license plates
- **FastAPI** REST endpoint
- **Real-time Inference** optimized for mobile

### Tech Stack
- Python 3.11
- FastAPI
- YOLOv8 (Ultralytics)
- OpenCV
- PIL

### Setup
```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run service
uvicorn app:app --reload --port 8001
```

### Detection Endpoint
```bash
curl -X POST http://localhost:8001/detect \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "base64_encoded_image",
    "latitude": 37.7749,
    "longitude": -122.4194
  }'
```

## 🗄️ Database Schema

### Users
- `id`, `username`, `email`, `password_hash`
- `points` (gamification)
- `avatar`, `created_at`, `updated_at`

### Hazards
- `id`, `user_id`, `type`, `severity`
- `latitude`, `longitude`, `location` (PostGIS)
- `image_url`, `description`
- `is_verified`, `verify_count`
- `created_at`, `updated_at`

### Device Tokens
- For push notifications (FCM)

### Notifications
- Notification history and delivery status

## 🐳 Docker Deployment

### Services
- **db** - PostgreSQL 15 + PostGIS
- **redis** - Redis 7
- **backend** - Golang API server
- **ai-service** - Python FastAPI
- **pgadmin** - Database management (dev only)

### Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean everything
docker-compose down -v
```

## 🔐 Security

- **JWT Authentication** with bcrypt password hashing
- **CORS** configured for mobile app
- **SQL Injection** protection via parameterized queries
- **Privacy** - Face and license plate blurring
- **Rate Limiting** on API endpoints
- **HTTPS** in production

## 📊 Monitoring & Logging

```bash
# View all logs
docker-compose logs -f

# Backend logs
docker-compose logs -f backend

# AI service logs
docker-compose logs -f ai-service

# Database logs
docker-compose logs -f db
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test ./...
```

### Frontend Tests
```bash
npm test
```

### API Testing
```bash
# Register user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Get nearby hazards
curl -X GET "http://localhost:8080/hazards?lat=37.7749&lon=-122.4194&radius=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚀 Production Deployment

### Environment Variables
```bash
# Backend
JWT_SECRET=your-super-secret-key
DB_PASSWORD=secure-password
AWS_ACCESS_KEY_ID=your-aws-key
FCM_SERVER_KEY=your-firebase-key

# Frontend
API_BASE_URL=https://api.yourdomain.com
```

### Cloud Platforms
- **AWS**: ECS + RDS + ElastiCache
- **GCP**: Cloud Run + Cloud SQL + Memorystore
- **Render**: Web Services + PostgreSQL + Redis

### Build for Production
```bash
# Backend
docker build -t roadeye-backend ./backend

# AI Service
docker build -t roadeye-ai ./ai-service

# Frontend (Expo)
eas build --platform android
eas build --platform ios
```

## 📚 Documentation

- [Frontend Setup](SETUP.md)
- [Backend Setup](BACKEND_SETUP.md)
- [Backend API](backend/README.md)
- [Database Migrations](backend/migrations/)

## 🛠️ Development

### Hot Reload

**Frontend:**
```bash
npm start
```

**Backend:**
```bash
# Install Air
go install github.com/cosmtrek/air@latest

# Run with hot reload
cd backend
air
```

**AI Service:**
```bash
cd ai-service
uvicorn app:app --reload
```

## 🔄 Workflow

1. **User opens app** → Requests location permission
2. **Map loads** → Fetches nearby hazards from backend
3. **User detects hazard** → Captures photo with camera
4. **AI analyzes** → YOLOv8 detects hazard type
5. **User confirms** → Hazard saved to database
6. **Backend processes** → Finds nearby users
7. **Notifications sent** → FCM push to affected users
8. **Community verifies** → Increases hazard credibility

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Expo** - React Native framework
- **YOLOv8** - Object detection model
- **PostGIS** - Geospatial database extension
- **Chi** - Lightweight Go router
- **FastAPI** - Modern Python web framework

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@roadeye.com
- Documentation: See README files in each directory

---

**Made with ❤️ for safer roads**
