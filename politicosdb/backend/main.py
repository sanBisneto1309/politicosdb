from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, Base
from routers import candidatos, partidos, noticias, tse_sync
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cria tabelas se não existirem (dev). Em prod, use Alembic.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="PolíticosDB API",
    description="Base de dados de candidatos e eleitos das eleições brasileiras.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candidatos.router, prefix="/candidatos", tags=["Candidatos"])
app.include_router(partidos.router,   prefix="/partidos",   tags=["Partidos"])
app.include_router(noticias.router,   prefix="/noticias",   tags=["Notícias"])
app.include_router(tse_sync.router,   prefix="/sync",       tags=["Sincronização TSE"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "app": "PolíticosDB API", "version": "0.1.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
