from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://politicos:politicos123@localhost:5432/politicosdb"
    TSE_API_BASE: str = "https://dadosabertos.tse.jus.br/api/3"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
