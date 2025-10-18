"""Configuration settings for PolyGrand backend"""

import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "PolyGrand"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Algorand
    ALGORAND_NETWORK: str = "testnet"
    ALGOD_SERVER: str = "https://testnet-api.algonode.cloud"
    ALGOD_TOKEN: str = ""
    INDEXER_SERVER: str = "https://testnet-idx.algonode.cloud"
    INDEXER_TOKEN: str = ""
    CREATOR_MNEMONIC: str = ""

    # Database (for future use)
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/polygrand"

    # Redis (for future use)
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Market Settings
    DEFAULT_MARKET_DURATION_DAYS: int = 30
    MIN_LIQUIDITY_AMOUNT: int = 100_000_000  # 100 ALGO in microAlgos
    PLATFORM_FEE_PERCENTAGE: float = 2.5

    # Tournament Settings
    MIN_TOURNAMENT_PARTICIPANTS: int = 2
    MAX_TOURNAMENT_PARTICIPANTS: int = 100

    # AI Settings
    AI_MODEL_ENABLED: bool = True
    AI_PREDICTION_THRESHOLD: float = 0.7

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
