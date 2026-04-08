from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import Partido

router = APIRouter()


class PartidoOut(BaseModel):
    id: int
    sigla: str
    nome: str
    numero: Optional[int] = None
    cor_hex: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/", response_model=list[PartidoOut])
async def listar_partidos(db: AsyncSession = Depends(get_db)):
    q = select(Partido).order_by(Partido.sigla)
    rows = (await db.execute(q)).scalars().all()
    return [PartidoOut.model_validate(r) for r in rows]
