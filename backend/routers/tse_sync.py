"""
Sincronização com a API de Dados Abertos do TSE.
Documentação: https://dadosabertos.tse.jus.br/

Endpoints utilizados:
  GET /api/3/action/package_list          → lista todos os datasets
  GET /api/3/action/package_show?id=...   → metadados de um dataset
  GET /api/3/action/datastore_search      → busca em dataset específico

Os dados de candidaturas ficam em datasets nomeados:
  candidatos-{ano}     ex: candidatos-2022, candidatos-2024
"""

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import httpx

from database import get_db
from models import Candidato, Partido
from config import settings

router = APIRouter()

TSE_BASE = settings.TSE_API_BASE


class SyncStatus(BaseModel):
    mensagem: str
    ano: int
    uf: Optional[str] = None
    job_id: Optional[str] = None


async def _buscar_candidatos_tse(ano: int, uf: Optional[str], db: AsyncSession):
    """
    Consulta o CKAN da TSE e importa candidatos para o banco local.
    Roda em background.
    """
    dataset_id = f"candidatos-{ano}"
    filters: dict = {}
    if uf:
        filters["SG_UF"] = uf.upper()

    params = {
        "resource_id": dataset_id,
        "limit": 500,
        "offset": 0,
        "filters": str(filters) if filters else "",
    }

    importados = 0
    async with httpx.AsyncClient(timeout=30) as client:
        while True:
            try:
                resp = await client.get(
                    f"{TSE_BASE}/action/datastore_search",
                    params=params,
                )
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                print(f"[TSE sync] erro na requisição: {e}")
                break

            records = data.get("result", {}).get("records", [])
            if not records:
                break

            for rec in records:
                sigla = rec.get("SG_PARTIDO", "").strip()
                if not sigla:
                    continue

                # Garante que o partido existe
                partido_q = select(Partido).where(Partido.sigla == sigla)
                partido = (await db.execute(partido_q)).scalar_one_or_none()
                if not partido:
                    partido = Partido(
                        sigla=sigla,
                        nome=rec.get("NM_PARTIDO", sigla),
                        numero=_safe_int(rec.get("NR_PARTIDO")),
                    )
                    db.add(partido)
                    await db.flush()

                # Evita duplicata (mesmo sq_candidato + ano)
                sq = str(rec.get("SQ_CANDIDATO", "")).strip()
                existe_q = select(Candidato).where(
                    Candidato.sq_candidato == sq,
                    Candidato.ano_eleicao == ano,
                )
                if sq and (await db.execute(existe_q)).scalar_one_or_none():
                    continue

                cand = Candidato(
                    nome=rec.get("NM_CANDIDATO", "").strip(),
                    nome_urna=rec.get("NM_URNA_CANDIDATO", "").strip(),
                    numero_candidato=_safe_int(rec.get("NR_CANDIDATO")) or 0,
                    cargo=rec.get("DS_CARGO", "").strip(),
                    partido_id=partido.id,
                    uf=rec.get("SG_UF", "").strip()[:2],
                    municipio=rec.get("NM_MUNICIPIO", "").strip() or None,
                    codigo_municipio_tse=str(rec.get("CD_MUNICIPIO", "")).strip() or None,
                    ano_eleicao=ano,
                    turno=_safe_int(rec.get("NR_TURNO")) or 1,
                    situacao=rec.get("DS_SIT_TOT_TURNO", "").strip() or None,
                    votos=_safe_int(rec.get("QT_VOTOS_NOMINAIS")),
                    genero=rec.get("DS_GENERO", "").strip() or None,
                    instrucao=rec.get("DS_GRAU_INSTRUCAO", "").strip() or None,
                    ocupacao=rec.get("DS_OCUPACAO", "").strip() or None,
                    sq_candidato=sq or None,
                )
                db.add(cand)
                importados += 1

            await db.commit()

            total = data.get("result", {}).get("total", 0)
            params["offset"] += len(records)
            if params["offset"] >= total:
                break

    print(f"[TSE sync] {importados} candidatos importados (ano={ano}, uf={uf})")


def _safe_int(val) -> Optional[int]:
    try:
        return int(val)
    except (TypeError, ValueError):
        return None


@router.post("/tse", response_model=SyncStatus)
async def sincronizar_tse(
    background_tasks: BackgroundTasks,
    ano: int = Query(..., description="Ano da eleição, ex: 2022 ou 2024"),
    uf:  Optional[str] = Query(None, description="Filtrar por UF, ex: SP"),
    db: AsyncSession = Depends(get_db),
):
    """
    Dispara sincronização em background com os dados do TSE.
    Pode levar alguns minutos dependendo do volume.
    """
    if ano not in (2020, 2022, 2024):
        raise HTTPException(status_code=400, detail="Ano deve ser 2020, 2022 ou 2024.")

    background_tasks.add_task(_buscar_candidatos_tse, ano, uf, db)

    return SyncStatus(
        mensagem=f"Sincronização iniciada em background para {ano}" + (f" / {uf.upper()}" if uf else ""),
        ano=ano,
        uf=uf,
    )


@router.get("/status", tags=["Sincronização TSE"])
async def status_sync():
    """Retorna informações sobre os datasets disponíveis no TSE."""
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(f"{TSE_BASE}/action/package_list")
            resp.raise_for_status()
            datasets = resp.json().get("result", [])
            eleitorais = [d for d in datasets if "candidatos" in d or "resultados" in d]
            return {"datasets_eleitorais": eleitorais[:20], "total": len(datasets)}
        except Exception as e:
            return {"erro": str(e), "dica": "Verifique se o TSE Dados Abertos está acessível."}
