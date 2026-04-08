from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from pydantic import BaseModel
from typing import Optional
from datetime import date

from database import get_db
from models import Candidato, Partido

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class PartidoOut(BaseModel):
    id: int
    sigla: str
    nome: str
    cor_hex: Optional[str] = None

    class Config:
        from_attributes = True


class CandidatoOut(BaseModel):
    id: int
    nome: str
    nome_urna: Optional[str] = None
    numero_candidato: int
    cargo: str
    partido: Optional[PartidoOut] = None
    uf: str
    municipio: Optional[str] = None
    ano_eleicao: int
    turno: Optional[int] = None
    situacao: Optional[str] = None
    votos: Optional[int] = None
    percentual_votos: Optional[float] = None
    genero: Optional[str] = None
    idade: Optional[int] = None
    instrucao: Optional[str] = None
    patrimonio_declarado: Optional[float] = None
    foto_url: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True


class CandidatoDetalhe(CandidatoOut):
    cpf: Optional[str] = None
    ocupacao: Optional[str] = None
    email: Optional[str] = None
    data_nascimento: Optional[date] = None


class EstatisticasOut(BaseModel):
    total: int
    eleitos: int
    partidos: int
    estados: int


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/", response_model=dict)
async def listar_candidatos(
    busca:    Optional[str] = Query(None, description="Nome ou número do candidato"),
    cargo:    Optional[str] = None,
    partido:  Optional[str] = None,
    uf:       Optional[str] = None,
    municipio:Optional[str] = None,
    situacao: Optional[str] = None,
    ano:      Optional[int] = None,
    genero:   Optional[str] = None,
    page:     int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(Candidato)
        .join(Partido, isouter=True)
        .order_by(Candidato.votos.desc().nullslast())
    )

    if busca:
        q = q.where(
            or_(
                Candidato.nome.ilike(f"%{busca}%"),
                Candidato.nome_urna.ilike(f"%{busca}%"),
                Candidato.numero_candidato == (int(busca) if busca.isdigit() else -1),
            )
        )
    if cargo:
        q = q.where(Candidato.cargo.ilike(f"%{cargo}%"))
    if partido:
        q = q.where(Partido.sigla == partido.upper())
    if uf:
        q = q.where(Candidato.uf == uf.upper())
    if municipio:
        q = q.where(Candidato.municipio.ilike(f"%{municipio}%"))
    if situacao:
        q = q.where(Candidato.situacao.ilike(f"%{situacao}%"))
    if ano:
        q = q.where(Candidato.ano_eleicao == ano)
    if genero:
        q = q.where(Candidato.genero == genero.upper())

    # Contagem total
    total_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(total_q)).scalar_one()

    # Paginação
    offset = (page - 1) * per_page
    q = q.offset(offset).limit(per_page)
    rows = (await db.execute(q)).scalars().all()

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
        "data": [CandidatoOut.model_validate(r) for r in rows],
    }


@router.get("/estatisticas", response_model=EstatisticasOut)
async def estatisticas(
    ano: Optional[int] = None,
    uf:  Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(Candidato)
    if ano:
        q = q.where(Candidato.ano_eleicao == ano)
    if uf:
        q = q.where(Candidato.uf == uf.upper())

    rows = (await db.execute(q)).scalars().all()
    eleitos_vals = {"eleito", "eleita"}

    return EstatisticasOut(
        total=len(rows),
        eleitos=sum(1 for r in rows if r.situacao and r.situacao.lower() in eleitos_vals),
        partidos=len({r.partido_id for r in rows if r.partido_id}),
        estados=len({r.uf for r in rows}),
    )


@router.get("/cargos", response_model=list[str])
async def listar_cargos(db: AsyncSession = Depends(get_db)):
    q = select(Candidato.cargo).distinct().order_by(Candidato.cargo)
    rows = (await db.execute(q)).scalars().all()
    return rows


@router.get("/{candidato_id}", response_model=CandidatoDetalhe)
async def detalhe_candidato(candidato_id: int, db: AsyncSession = Depends(get_db)):
    q = select(Candidato).where(Candidato.id == candidato_id)
    row = (await db.execute(q)).scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Candidato não encontrado")
    return CandidatoDetalhe.model_validate(row)
