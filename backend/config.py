"""
Central configuration — reads from .env automatically.
All fields have safe defaults so the server starts even without API keys.
Set real values in backend/.env before calling MongoDB or LLM routes.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── MongoDB ──────────────────────────────────────────────
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "cineforge"

    # ── HuggingFace (primary LLM) ─────────────────────────────
    hf_api_token: str = ""
    hf_model: str = "mistralai/Mistral-7B-Instruct-v0.2"
    hf_timeout: int = 60

    # ── Gemini (fallback LLM) ─────────────────────────────────
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"

    # ── Security ──────────────────────────────────────────────
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours

    # ── CORS ──────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # ── Rate limiting ─────────────────────────────────────────
    rate_limit_per_minute: int = 60

    # ── App ───────────────────────────────────────────────────
    app_env: str = "development"
    app_port: int = 8000

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def mongodb_configured(self) -> bool:
        return bool(self.mongodb_uri)

    @property
    def llm_configured(self) -> bool:
        return bool(self.hf_api_token or self.gemini_api_key)


@lru_cache()
def get_settings() -> Settings:
    return Settings()
