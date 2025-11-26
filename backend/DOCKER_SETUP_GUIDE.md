# Docker Setup Guide for AgentOps Backend

This guide explains how to containerize and run your FastAPI backend with Supabase.

## 📋 Architecture Overview

Your setup uses:

- **Backend**: FastAPI (Python) - Containerized with Docker
- **Database**: Supabase (PostgreSQL) - Managed cloud service (NOT containerized)
- **Redis**: Optional caching layer - Containerized

Since Supabase is a managed database service, you only need to containerize your backend application and connect it to Supabase via connection string.

---

## 🚀 Quick Start

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and update with your actual values:

```bash
cp .env.example .env
```

**Important**: Update your `.env` file with your Supabase credentials:

```bash
# Get your Supabase connection string from:
# Supabase Dashboard > Project Settings > Database > Connection String (URI)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Your other variables
SECRET_KEY=your-super-secret-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key-from-google-ai-studio
```

### 2. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### 3. Access Your Application

- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## 🛠️ Docker Commands Cheat Sheet

### Building

```bash
# Build backend image
docker-compose build backend

# Rebuild without cache (clean build)
docker-compose build --no-cache backend
```

### Running

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Start specific service
docker-compose up backend

# Build and start in one command
docker-compose up --build
```

### Stopping

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### Viewing Logs

```bash
# View logs from all services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Logs from specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Container Management

```bash
# List running containers
docker-compose ps

# Execute command in running container
docker-compose exec backend bash

# Restart a service
docker-compose restart backend

# View resource usage
docker stats
```

---

## 🔍 Debugging

### Check if backend is running

```bash
curl http://localhost:8000/health
```

### Access container shell

```bash
docker-compose exec backend bash
```

### View application logs

```bash
docker-compose logs -f backend
```

### Test database connection from container

```bash
docker-compose exec backend python -c "from app.database import engine; print(engine.connect())"
```

---

## 🏗️ Development Workflow

### Option 1: Docker for Development (Recommended for Production-Like Environment)

```bash
# Make code changes in your editor
# Rebuild and restart
docker-compose up --build backend
```

### Option 2: Local Development (Faster Iteration)

```bash
# Run backend locally (requires Python virtual environment)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🌐 Production Deployment

### 1. Update Environment Variables

Create a production `.env` file:

```bash
DATABASE_URL=postgresql://postgres:[PROD-PASSWORD]@db.[PROD-PROJECT-REF].supabase.co:5432/postgres
SECRET_KEY=strong-random-production-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GEMINI_API_KEY=your-production-gemini-api-key
```

### 2. Production Docker Compose Override

Create `docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  backend:
    restart: always
    environment:
      - ENV=production
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Run with:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Deploy to Cloud Platforms

#### Option A: Deploy to Railway/Render

1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Railway/Render will auto-detect Dockerfile and deploy

#### Option B: Deploy to AWS ECS/GCP Cloud Run

```bash
# Build for your platform
docker build -t agentops-backend:latest ./backend

# Tag for your registry
docker tag agentops-backend:latest [YOUR-REGISTRY]/agentops-backend:latest

# Push to registry
docker push [YOUR-REGISTRY]/agentops-backend:latest
```

#### Option C: Deploy to a VPS (DigitalOcean, Linode, etc.)

```bash
# SSH into your server
ssh user@your-server-ip

# Clone repository
git clone [your-repo-url]
cd agentops-monitor

# Create .env file with production values
nano .env

# Run with Docker Compose
docker-compose up -d --build

# Setup nginx reverse proxy (optional)
sudo apt install nginx
# Configure nginx to proxy to localhost:8000
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - They contain secrets
2. **Use strong SECRET_KEY** - Generate with: `openssl rand -hex 32`
3. **Enable CORS properly** - Update `app/main.py` to restrict origins in production
4. **Use HTTPS** - In production, always use SSL/TLS
5. **Keep dependencies updated** - Regularly update `requirements.txt`
6. **Run as non-root user** - Already configured in Dockerfile
7. **Use health checks** - Already configured in docker-compose.yml

---

## 📁 File Structure

```
agentops-monitor/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── ...
│   ├── Dockerfile           # Backend container definition
│   ├── .dockerignore        # Files to exclude from Docker build
│   └── requirements.txt     # Python dependencies
├── docker-compose.yml       # Multi-container orchestration
├── .env                     # Environment variables (gitignored)
└── .env.example            # Environment template
```

---

## ❓ Troubleshooting

### Issue: Backend can't connect to Supabase

**Solution**:

- Verify your `DATABASE_URL` is correct
- Check if your Supabase project allows connections from your IP
- Ensure password doesn't contain special characters that need URL encoding

### Issue: Port 8000 already in use

**Solution**:

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 [PID]

# Or change the port in docker-compose.yml
ports:
  - "8001:8000"
```

### Issue: Changes not reflecting in container

**Solution**:

```bash
# Rebuild without cache
docker-compose down
docker-compose up --build --force-recreate
```

### Issue: Permission denied errors

**Solution**:

```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🎯 Next Steps

1. ✅ Set up your Supabase project and get connection string
2. ✅ Update `.env` file with real credentials
3. ✅ Run `docker-compose up --build`
4. ✅ Test API at http://localhost:8000/docs
5. ✅ Deploy to production when ready

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Need help?** Check the logs with `docker-compose logs -f backend`
