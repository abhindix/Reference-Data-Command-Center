"""Application configuration"""

from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "Loan Reference Data Platform"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    TEST_MODE: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/loan_ref_db"
    
    # AWS
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost", "http://localhost:3000"]
    
    model_config = ConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
