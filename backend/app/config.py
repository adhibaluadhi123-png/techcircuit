"""Application Configuration for CANON Backend."""
from pathlib import Path
from typing import Optional
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "CANON Brand Governance Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database configuration
    # Default to local SQLite for lightweight local dev and automated tests
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/canon.db"
    
    # LLM / Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:1.5b"
    OLLAMA_FALLBACK_MODEL: str = "qwen2.5:1.5b"
    OLLAMA_TIMEOUT_SECONDS: float = 45.0
    ALLOW_MOCK_LLM_FALLBACK: bool = True
    
    # Security & Privacy
    SECRET_KEY: str = "canon-hackathon-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    DEFAULT_WORKSPACE_ID: str = "ws-apexdynamics-001"
    
    # Ingestion Limits
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg"]

    model_config = ConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
