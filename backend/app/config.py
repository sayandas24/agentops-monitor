# What it does: Loads .env variables and makes them available to entire app

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    
    # Gemini API
    GEMINI_API_KEY: str
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
