from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Partido(Base):
    __tablename__ = "partidos"

    id         = Column(Integer, primary_key=True)
    sigla      = Column(String(20), unique=True, nullable=False)
    nome       = Column(Text, nullable=False)
    numero     = Column(Integer)
    cor_hex    = Column(String(7))
    created_at = Column(DateTime, server_default=func.now())

    candidatos = relationship("Candidato", back_populates="partido")


class Candidato(Base):
    __tablename__ = "candidatos"

    id                       = Column(Integer, primary_key=True)
    nome                     = Column(Text, nullable=False)
    nome_urna                = Column(Text)
    cpf                      = Column(String(14))
    numero_candidato         = Column(Integer, nullable=False)
    cargo                    = Column(String(60), nullable=False)
    partido_id               = Column(Integer, ForeignKey("partidos.id"))
    uf                       = Column(String(2), nullable=False)
    municipio                = Column(Text)
    codigo_municipio_tse     = Column(String(10))
    ano_eleicao              = Column(Integer, nullable=False)
    turno                    = Column(Integer, default=1)
    situacao                 = Column(String(40))
    votos                    = Column(Integer, default=0)
    percentual_votos         = Column(Numeric(5, 2))
    genero                   = Column(String(20))
    data_nascimento          = Column(Date)
    idade                    = Column(Integer)
    instrucao                = Column(String(60))
    ocupacao                 = Column(Text)
    patrimonio_declarado     = Column(Numeric(15, 2))
    email                    = Column(Text)
    sq_candidato             = Column(String(20))
    nr_protocolo_candidatura = Column(String(20))
    foto_url                 = Column(Text)
    bio                      = Column(Text)
    created_at               = Column(DateTime, server_default=func.now())
    updated_at               = Column(DateTime, server_default=func.now(), onupdate=func.now())

    partido  = relationship("Partido", back_populates="candidatos")
    noticias = relationship("Noticia", back_populates="candidato", cascade="all, delete-orphan")


class Noticia(Base):
    __tablename__ = "noticias"

    id           = Column(Integer, primary_key=True)
    candidato_id = Column(Integer, ForeignKey("candidatos.id", ondelete="CASCADE"))
    titulo       = Column(Text, nullable=False)
    url          = Column(Text)
    fonte        = Column(String(60))
    publicado_em = Column(DateTime)
    resumo       = Column(Text)
    criado_em    = Column(DateTime, server_default=func.now())

    candidato = relationship("Candidato", back_populates="noticias")
