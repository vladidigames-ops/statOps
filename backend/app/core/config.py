from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    env: Literal["dev", "test", "prod"] = "dev"
    debug: bool = True

    app_name: str = "statOps"
    api_v1_prefix: str = "/api/v1"

    database_url: str = Field(
        default="postgresql+asyncpg://statops:statops@localhost:5432/statops"
    )
    redis_url: str = Field(default="redis://localhost:6379/0")

    jwt_secret_key: str = Field(default="change-me-in-prod-please-and-make-it-long-enough")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expires_minutes: int = 60 * 24
    jwt_refresh_token_expires_days: int = 30

    credentials_encryption_key: str = Field(
        default="dev-only-change-in-prod-dev-only-change-in-prod-32b="
    )

    cors_allow_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5181"])

    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"

    @property
    def sync_database_url(self) -> str:
        return str(self.database_url).replace("+asyncpg", "")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
