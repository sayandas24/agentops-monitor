"""
Main FastAPI application
Starts server, connects routes, creates database tables in Supabase
"""
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api import auth, projects, traces, analytics
from app.database import Base, engine
from app.config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Create all database tables in Supabase
logger.info("Creating database tables in Supabase...")
Base.metadata.create_all(bind=engine)
logger.info("✅ Database tables created!")

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title="AgentOps Monitor API",
    description="ADK-Native AI Agent Observability Platform",
    version="1.0.0"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Request size limit middleware (10 MB max)
@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    max_size = 10 * 1024 * 1024  # 10 MB
    content_length = request.headers.get("content-length")
    
    if content_length and int(content_length) > max_size:
        logger.warning(f"Request too large: {content_length} bytes from {request.client.host}")
        raise HTTPException(status_code=413, detail="Request body too large (max 10MB)")
    
    response = await call_next(request)
    return response

# CORS - Restrict to specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # Only allow specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(traces.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {
        "message": "AgentOps Monitor API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

logger.info(f"AgentOps Monitor API started. Allowed origins: {settings.ALLOWED_ORIGINS}")
