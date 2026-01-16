"""
Configuration settings for the Calendly Clone API.
Uses pydantic-settings for environment variable management.
"""
import os
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings

# Find .env file - check current dir, then parent
def find_env_file():
    """Find .env file in current or parent directory."""
    if os.path.exists(".env"):
        return ".env"
    elif os.path.exists("../.env"):
        return "../.env"
    return ".env"  # Default, will use environment variables on Vercel


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = "Calendly Clone API"
    debug: bool = True
    api_version: str = "v1"
    
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/calendly_db"
    
    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = find_env_file()
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()

