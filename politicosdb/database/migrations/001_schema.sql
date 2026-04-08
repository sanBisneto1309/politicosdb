-- PolíticosDB — Schema principal
-- Migration: 001_schema.sql

CREATE EXTENSION IF NOT EXISTS unaccent;

-- Partidos políticos
CREATE TABLE partidos (
    id          SERIAL PRIMARY KEY,
    sigla       VARCHAR(20) UNIQUE NOT NULL,
    nome        TEXT NOT NULL,
    numero      INTEGER,
    cor_hex     VARCHAR(7),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Candidatos
CREATE TABLE candidatos (
    id                  SERIAL PRIMARY KEY,
    nome                TEXT NOT NULL,
    nome_urna           TEXT,
    cpf                 VARCHAR(14),
    numero_candidato    INTEGER NOT NULL,
    cargo               VARCHAR(60) NOT NULL,
    partido_id          INTEGER REFERENCES partidos(id),
    uf                  CHAR(2) NOT NULL,
    municipio           TEXT,
    codigo_municipio_tse VARCHAR(10),
    ano_eleicao         INTEGER NOT NULL,
    turno               INTEGER DEFAULT 1,
    situacao            VARCHAR(40),   -- Eleito, Não eleito, Suplente, etc.
    votos               INTEGER DEFAULT 0,
    percentual_votos    NUMERIC(5,2),
    -- Perfil
    genero              VARCHAR(20),
    data_nascimento     DATE,
    idade               INTEGER,
    instrucao           VARCHAR(60),
    ocupacao            TEXT,
    patrimonio_declarado NUMERIC(15,2),
    email               TEXT,
    -- TSE IDs para sync
    sq_candidato        VARCHAR(20),   -- sequencial TSE
    nr_protocolo_candidatura VARCHAR(20),
    -- Metadados
    foto_url            TEXT,
    bio                 TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- Índices para os filtros mais comuns
CREATE INDEX idx_candidatos_cargo     ON candidatos(cargo);
CREATE INDEX idx_candidatos_partido   ON candidatos(partido_id);
CREATE INDEX idx_candidatos_uf        ON candidatos(uf);
CREATE INDEX idx_candidatos_ano       ON candidatos(ano_eleicao);
CREATE INDEX idx_candidatos_situacao  ON candidatos(situacao);
CREATE INDEX idx_candidatos_nome_trgm ON candidatos USING gin(to_tsvector('portuguese', unaccent(nome)));

-- Notícias vinculadas a candidatos
CREATE TABLE noticias (
    id              SERIAL PRIMARY KEY,
    candidato_id    INTEGER REFERENCES candidatos(id) ON DELETE CASCADE,
    titulo          TEXT NOT NULL,
    url             TEXT,
    fonte           VARCHAR(60),
    publicado_em    TIMESTAMP,
    resumo          TEXT,
    criado_em       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_noticias_candidato ON noticias(candidato_id);
CREATE INDEX idx_noticias_data      ON noticias(publicado_em DESC);

-- Log de sincronizações com o TSE
CREATE TABLE sync_log (
    id          SERIAL PRIMARY KEY,
    tipo        VARCHAR(40),  -- 'tse_candidatos', 'rss_noticias'
    ano         INTEGER,
    uf          CHAR(2),
    status      VARCHAR(20),  -- 'ok', 'erro'
    detalhes    JSONB,
    executado_em TIMESTAMP DEFAULT NOW()
);
