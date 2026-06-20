import logging
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "GreenField Farm Care API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/greenfield_db"

    REDIS_URL: str = "redis://localhost:6379/0"

    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET_NAME: str = "greenfield-farmcare"

    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    def get_allowed_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    def model_post_init(self, __context) -> None:
        if self.APP_ENV != "development" and self.SECRET_KEY == "change-this-in-production":
            logging.getLogger("app.config").error(
                "SECURITY WARNING: SECRET_KEY is still the default value in APP_ENV='%s'. "
                "Set a strong random SECRET_KEY in your environment immediately.",
                self.APP_ENV,
            )

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
