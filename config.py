"""
Configuration management for Flatifigo.
Settings are loaded from environment variables (or a .env file for local dev).
"""

import os
from dotenv import load_dotenv

# Load .env file when present (local development)
load_dotenv()


class Config:
    # ── Security ──
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "change-me-in-production")
    JWT_EXPIRY_HOURS: int = int(os.environ.get("JWT_EXPIRY_HOURS", "24"))

    # ── Database ──
    # SQLite path used when DATABASE_URL is not set (local / CI)
    DATABASE_URL: str = os.environ.get(
        "DATABASE_URL",
        "sqlite:///" + os.path.join(os.path.dirname(__file__), "flatifigo.db"),
    )

    # ── Storage ──
    UPLOAD_FOLDER: str = os.environ.get(
        "UPLOAD_FOLDER",
        os.path.join(os.path.dirname(__file__), "uploads"),
    )
    MAX_CONTENT_LENGTH: int = int(os.environ.get("MAX_CONTENT_LENGTH", str(16 * 1024 * 1024)))

    # ── Server ──
    PORT: int = int(os.environ.get("PORT", "5000"))
    DEBUG: bool = os.environ.get("DEBUG", "false").lower() == "true"

    # ── CORS ──
    # Comma-separated list of allowed origins, e.g. "https://app.example.com,https://www.example.com"
    # Use "*" (default) to allow all origins.
    CORS_ORIGINS: str = os.environ.get("CORS_ORIGINS", "*")
