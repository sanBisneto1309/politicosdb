# PolíticosDB 🗳️

Base de dados de candidatos e eleitos das eleições brasileiras, com integração à API do TSE e portais de notícias.

## Estrutura do Projeto

```
politicosdb/
├── frontend/          # React + Vite + TailwindCSS
├── backend/           # FastAPI (Python)
├── database/          # Schemas e migrations (PostgreSQL)
└── docker-compose.yml
```

## Pré-requisitos

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Docker (opcional)

---

## Rodando com Docker (recomendado)

```bash
docker-compose up --build
```

Acesse: http://localhost:5173

---

## Rodando manualmente

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edite as variáveis
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env            # edite as variáveis
npm run dev
```

### Banco de Dados

```bash
cd database
psql -U postgres -c "CREATE DATABASE politicosdb;"
psql -U postgres -d politicosdb -f migrations/001_schema.sql
psql -U postgres -d politicosdb -f migrations/002_seed.sql
```

---

## Funcionalidades

- 🔍 Filtros por cargo, partido, UF, cidade, situação e ano
- 📊 Estatísticas dinâmicas (eleitos, partidos, estados)
- 📰 Notícias recentes via RSS dos principais portais
- 🗂️ Dados eleitorais via API pública do TSE
- 📱 Interface responsiva (cards e tabela)

## Integrações

| Fonte | Tipo | Descrição |
|---|---|---|
| TSE Dados Abertos | REST API + CSV | Candidatos, resultados, bens |
| G1 / Folha / UOL | RSS Feed | Notícias por nome do político |
| IBGE | REST API | Municípios e estados |
