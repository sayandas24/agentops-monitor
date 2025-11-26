# AgentOps Monitor - Deployment Guide

## Overview: What Goes Where?

Your AgentOps Monitor project has **3 main components**:

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SDK (agentops-monitor)                                  │
│     └─> Published to PyPI                                   │
│     └─> Users install: pip install agentops-monitor        │
│     └─> Runs in THEIR applications                         │
│                                                              │
│  2. Backend (FastAPI)                                       │
│     └─> Deploy to: Cloud server (AWS/GCP/DigitalOcean)    │
│     └─> Receives traces from SDK                           │
│     └─> Stores data in PostgreSQL                          │
│                                                              │
│  3. Frontend (React/Next.js)                                │
│     └─> Deploy to: Vercel/Netlify/Same server as backend  │
│     └─> Dashboard for viewing traces                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Strategy

### 1. SDK → PyPI (For Users to Install)

**What:** The Python package users install in their projects
**Where:** PyPI (Python Package Index)
**How:** 

```bash
cd sdk
python -m build
twine upload dist/*
```

**After Publishing:**
- Users install with: `pip install agentops-monitor`
- SDK runs in THEIR applications
- SDK sends data to YOUR backend

### 2. Backend → Cloud Server (Your Infrastructure)

**What:** FastAPI server that receives and stores monitoring data
**Where:** Deploy to a cloud provider

**Option A: Docker (Recommended)**

Deploy to any cloud provider with Docker support:

**DigitalOcean (Easiest, $6/month):**
```bash
# 1. Create a Droplet (Ubuntu + Docker)
# 2. SSH into your droplet
ssh root@your-droplet-ip

# 3. Clone your repo
git clone https://github.com/yourusername/agentops-monitor.git
cd agentops-monitor

# 4. Set up environment
cp backend/.env.example backend/.env
nano backend/.env  # Edit with your settings

# 5. Start with Docker Compose
docker-compose up -d

# Backend runs on: http://your-droplet-ip:8000
# Frontend runs on: http://your-droplet-ip:3000
```

**AWS EC2:**
```bash
# 1. Launch EC2 instance (t2.micro for free tier)
# 2. Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start

# 3. Clone and run
git clone https://github.com/yourusername/agentops-monitor.git
cd agentops-monitor
docker-compose up -d
```

**Google Cloud Run (Serverless):**
```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/agentops-backend backend/
gcloud run deploy agentops-backend --image gcr.io/PROJECT_ID/agentops-backend
```

**Option B: Manual Deployment (Without Docker)**

```bash
# On your server
cd backend
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://user:pass@localhost:5432/agentops"
export SECRET_KEY="your-secret-key"

# Run with systemd or supervisor
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Frontend → Vercel/Netlify (Static Hosting)

**What:** React dashboard for viewing traces
**Where:** Vercel (recommended) or Netlify

**Vercel (Free):**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
cd frontend
vercel

# Follow prompts, set environment variable:
# NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

**Netlify:**
```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Deploy
cd frontend
netlify deploy --prod
```

## Do You Need Docker?

**Short Answer: No, but it makes life easier.**

### With Docker ✅
- One command to start everything: `docker-compose up -d`
- Automatic PostgreSQL setup
- Consistent environment across machines
- Easy to update and rollback
- Recommended for production

### Without Docker ⚠️
- Manual PostgreSQL installation and configuration
- Manual dependency management
- More setup steps
- Works fine, just more manual work

## Recommended Deployment Flow

### For Production (Users will use this):

```
Step 1: Deploy Backend
├─> Choose: DigitalOcean Droplet ($6/month)
├─> Use: Docker Compose
├─> Get: Public IP (e.g., 123.45.67.89)
└─> Backend URL: http://123.45.67.89:8000

Step 2: Deploy Frontend
├─> Choose: Vercel (Free)
├─> Set: NEXT_PUBLIC_API_URL=http://123.45.67.89:8000
└─> Get: https://agentops-monitor.vercel.app

Step 3: Publish SDK
├─> Build: python -m build
├─> Upload: twine upload dist/*
└─> Users install: pip install agentops-monitor

Step 4: Update SDK README
└─> Set default AGENTOPS_BASE_URL to your backend URL
```

## Environment Variables

### Backend (.env)
```bash
# Database (Use Supabase free tier or local PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Security
SECRET_KEY=your-random-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Optional: Gemini API for AI features
GEMINI_API_KEY=your-gemini-key
```

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=http://your-backend-url:8000
```

### SDK (Users' .env)
```bash
AGENTOPS_API_KEY=key-from-your-dashboard
AGENTOPS_PROJECT_ID=project-id-from-dashboard
AGENTOPS_BASE_URL=http://your-backend-url:8000
```

## Database Options

### Option 1: Supabase (Free, Managed PostgreSQL)
- Free tier: 500MB database
- No setup required
- Get connection string from dashboard
- **Recommended for getting started**

### Option 2: Docker PostgreSQL
- Included in docker-compose.yml
- Runs alongside backend
- Need to manage backups

### Option 3: Managed Database
- AWS RDS, Google Cloud SQL, DigitalOcean Managed DB
- More expensive but fully managed
- Good for production at scale

## Cost Breakdown

### Minimal Setup (Free/Cheap):
- **SDK**: Free (hosted on PyPI)
- **Backend**: DigitalOcean Droplet $6/month
- **Database**: Supabase Free tier (500MB)
- **Frontend**: Vercel Free tier
- **Total**: ~$6/month

### Production Setup:
- **SDK**: Free (hosted on PyPI)
- **Backend**: AWS EC2 t3.small ~$15/month
- **Database**: AWS RDS ~$15/month
- **Frontend**: Vercel Pro $20/month (optional)
- **Total**: ~$30-50/month

## Quick Start Commands

### 1. Local Development (Test everything)
```bash
# Start backend + database
docker-compose up -d

# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# PostgreSQL: localhost:5432
```

### 2. Deploy Backend (DigitalOcean)
```bash
# SSH into droplet
ssh root@your-ip

# Clone and start
git clone https://github.com/yourusername/agentops-monitor.git
cd agentops-monitor
docker-compose up -d
```

### 3. Deploy Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### 4. Publish SDK (PyPI)
```bash
cd sdk
python -m build
twine upload dist/*
```

## Security Checklist

Before going to production:

- [ ] Change SECRET_KEY in backend/.env to a random string
- [ ] Use HTTPS for backend (set up SSL certificate)
- [ ] Set up firewall rules (only allow ports 80, 443, 22)
- [ ] Use environment variables, never commit secrets
- [ ] Set up database backups
- [ ] Enable CORS only for your frontend domain
- [ ] Use strong passwords for database
- [ ] Keep dependencies updated

## Next Steps

1. **Test Locally**: Run `docker-compose up -d` and test everything
2. **Deploy Backend**: Choose DigitalOcean or AWS and deploy
3. **Deploy Frontend**: Push to Vercel
4. **Publish SDK**: Build and upload to PyPI
5. **Update Documentation**: Add your backend URL to SDK README
6. **Test End-to-End**: Install SDK from PyPI and test against your backend

## Need Help?

- Docker issues: Check `docker-compose logs`
- Backend issues: Check `docker logs agentops-backend`
- Database issues: Check `docker logs agentops-db`
- SDK issues: Check the traces in your dashboard
