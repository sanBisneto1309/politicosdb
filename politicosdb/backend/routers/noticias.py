from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import feedparser
import httpx

from database import get_db
from models import Noticia, Candidato

router = APIRouter()

# Feeds RSS dos principais portais brasileiros
# O parâmetro {query} é substituído pelo nome do candidato (URL-encoded)
RSS_FEEDS = {
    "G1":       "https://g1.globo.com/rss/g1/",
    "UOL":      "https://rss.uol.com.br/feed/noticias.xml",
    "Folha":    "https://feeds.folha.uol.com.br/poder/rss091.xml",
    "Carta Capital": "https://www.cartacapital.com.br/feed/",
}


class NoticiaOut(BaseModel):
    id: int
    titulo: str
    url: Optional[str] = None
    fonte: Optional[str] = None
    publicado_em: Optional[datetime] = None
    resumo: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/{candidato_id}", response_model=list[NoticiaOut])
async def noticias_do_candidato(candidato_id: int, db: AsyncSession = Depends(get_db)):
    """Retorna notícias salvas no banco para um candidato."""
    q = (
        select(Noticia)
        .where(Noticia.candidato_id == candidato_id)
        .order_by(Noticia.publicado_em.desc())
        .limit(10)
    )
    rows = (await db.execute(q)).scalars().all()
    return [NoticiaOut.model_validate(r) for r in rows]


@router.post("/{candidato_id}/sincronizar", response_model=list[NoticiaOut])
async def sincronizar_noticias(candidato_id: int, db: AsyncSession = Depends(get_db)):
    """
    Busca notícias via RSS usando o nome do candidato e salva no banco.
    Executa de forma síncrona com feedparser (rápido para MVP).
    """
    cand_q = select(Candidato).where(Candidato.id == candidato_id)
    candidato = (await db.execute(cand_q)).scalar_one_or_none()
    if not candidato:
        raise HTTPException(status_code=404, detail="Candidato não encontrado")

    nome = candidato.nome
    novas: list[Noticia] = []

    for fonte, url in RSS_FEEDS.items():
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:20]:
                titulo = entry.get("title", "")
                # Filtra entradas que mencionam o nome do candidato
                if nome.split()[0].lower() not in titulo.lower() and \
                   nome.split()[-1].lower() not in titulo.lower():
                    continue

                # Evita duplicatas
                existe_q = select(Noticia).where(
                    Noticia.candidato_id == candidato_id,
                    Noticia.titulo == titulo,
                )
                existe = (await db.execute(existe_q)).scalar_one_or_none()
                if existe:
                    continue

                pub = None
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    import time
                    pub = datetime.fromtimestamp(time.mktime(entry.published_parsed))

                noticia = Noticia(
                    candidato_id=candidato_id,
                    titulo=titulo,
                    url=entry.get("link"),
                    fonte=fonte,
                    publicado_em=pub,
                    resumo=entry.get("summary", "")[:500] if entry.get("summary") else None,
                )
                db.add(noticia)
                novas.append(noticia)
        except Exception:
            # Falha silenciosa por feed — não interrompe os outros
            continue

    if novas:
        await db.commit()
        for n in novas:
            await db.refresh(n)

    return [NoticiaOut.model_validate(n) for n in novas]
