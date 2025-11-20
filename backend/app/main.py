"""
Main FastAPI application
Starts server, connects routes, creates database tables in Supabase
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, projects, traces
from app.database import Base, engine

# Create all database tables in Supabase
print("Creating database tables in Supabase...")
Base.metadata.create_all(bind=engine)
print("✅ Database tables created!")

# Initialize FastAPI app
app = FastAPI(
    title="AgentOps Monitor API",
    description="ADK-Native AI Agent Observability Platform",
    version="1.0.0"
)

# CORS - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://*.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(traces.router)

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
