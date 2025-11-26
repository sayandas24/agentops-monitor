# 🐳 Docker Setup for AgentOps Backend

Complete Docker configuration for running the FastAPI backend with Supabase.

## 📂 File Structure

```
backend/
├── app/                        # FastAPI application code
├── Dockerfile                  # Development Docker configuration
├── Dockerfile.prod             # Production-optimized build
├── .dockerignore               # Build optimization
├── docker-compose.yml          # Service orchestration
├── docker-start.sh             # Interactive helper script
├── .env.example                # Environment template
├── requirements.txt            # Python dependencies
├── DOCKER_README.md            # Detailed Docker info
├── DOCKER_SETUP_GUIDE.md       # Comprehensive guide
└── DOCKER_SUMMARY.md           # Quick reference
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 2. Run with Docker

**Option A: Interactive Script (Easiest)**

```bash
./docker-start.sh
# Select option 1 for development
```

**Option B: Docker Compose**

```bash
docker-compose up --build
```

**Option C: Docker Only**

```bash
docker build -t agentops-backend .
docker run -p 8000:8000 --env-file .env agentops-backend
```

### 3. Access Your API

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **API Root**: http://localhost:8000

## 🔧 Configuration

### Required Environment Variables

Edit `.env` file with these values:

```bash
# Get from: Supabase Dashboard > Project Settings > Database > Connection String
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Generate with: openssl rand -hex 32
SECRET_KEY=your-super-secret-key

# From Google AI Studio
GEMINI_API_KEY=your-gemini-api-key

# Optional (has defaults)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

## 📊 Common Commands

### Development

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Production

```bash
# Build production image
docker build -f Dockerfile.prod -t agentops-backend:prod .

# Run production
docker run -p 8000:8000 --env-file .env agentops-backend:prod
```

### Debugging

```bash
# Access container shell
docker-compose exec backend bash

# Check database connection
docker-compose exec backend python -c "from app.database import engine; print(engine.connect())"

# View container stats
docker stats agentops_backend

# Inspect container
docker inspect agentops_backend
```

### Maintenance

```bash
# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Remove unused images
docker system prune -a

# Check disk usage
docker system df
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          Docker Host                     │
│  ┌───────────────────────────────────┐  │
│  │   Backend Container (Port 8000)   │  │
│  │   - FastAPI Application           │  │
│  │   - Uvicorn Server                │  │
│  │   - Health Checks                 │  │
│  └───────────┬───────────────────────┘  │
│              │                           │
│  ┌───────────┴───────────────────────┐  │
│  │   Redis Container (Port 6379)     │  │
│  │   - Optional Caching              │  │
│  └───────────────────────────────────┘  │
│                                          │
│         agentops_network                 │
└──────────────┬───────────────────────────┘
               │
               │ DATABASE_URL
               ↓
    ┌─────────────────────┐
    │  Supabase Cloud     │
    │  PostgreSQL DB      │
    └─────────────────────┘
```

## 🌍 Deployment

### Railway / Render

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Platform auto-deploys from Dockerfile

### Docker Hub

```bash
# Build and tag
docker build -t yourusername/agentops-backend:latest .

# Push to Docker Hub
docker push yourusername/agentops-backend:latest

# Pull and run anywhere
docker pull yourusername/agentops-backend:latest
docker run -p 8000:8000 --env-file .env yourusername/agentops-backend:latest
```

### VPS (DigitalOcean, Linode, etc.)

```bash
# On your server
git clone https://github.com/yourusername/agentops-monitor.git
cd agentops-monitor/backend

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Run
docker-compose up -d --build
```

## 🔒 Security

- ✅ Runs as non-root user (`appuser`)
- ✅ Minimal base image (Python 3.11 slim)
- ✅ No secrets in Dockerfile
- ✅ Health checks enabled
- ✅ Dependencies pinned in requirements.txt

### Pre-Deployment Checklist

- [ ] Strong `SECRET_KEY` generated
- [ ] Production `DATABASE_URL` configured
- [ ] CORS origins restricted in `app/main.py`
- [ ] HTTPS/SSL enabled
- [ ] Environment variables secured
- [ ] Firewall rules configured
- [ ] Monitoring/logging set up

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker logs agentops_backend

# Rebuild without cache
docker-compose build --no-cache

# Verify environment variables
docker-compose config
```

### Can't connect to Supabase

```bash
# Test connection inside container
docker-compose exec backend python -c "
from app.database import engine
try:
    engine.connect()
    print('✅ Database connected!')
except Exception as e:
    print(f'❌ Connection failed: {e}')
"
```

### Port already in use

```bash
# Find process using port
lsof -i :8000

# Kill it
kill -9 [PID]

# Or change port in docker-compose.yml
ports:
  - "8001:8000"
```

### Permission errors

```bash
# Fix file ownership
sudo chown -R $USER:$USER .

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

## 📚 Documentation

- **DOCKER_README.md** - Detailed Docker configuration info
- **DOCKER_SETUP_GUIDE.md** - Comprehensive setup guide
- **DOCKER_SUMMARY.md** - Quick reference

## 🎯 Next Steps

1. ✅ Configure `.env` with your Supabase credentials
2. ✅ Run `docker-compose up --build`
3. ✅ Test API at http://localhost:8000/docs
4. ✅ Deploy to production

---

**Need help?** Check the detailed guides in this directory or run `./docker-start.sh` for interactive setup.
