import type {
  Candidato,
  Partido,
  Noticia,
  Estatisticas,
  PaginatedResponse,
  Filtros,
} from "../utils/types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function post<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  // Candidatos
  async listarCandidatos(
    filtros: Partial<Filtros>,
    page = 1,
    perPage = 20
  ): Promise<PaginatedResponse<Candidato>> {
    return get("/candidatos/", {
      busca:    filtros.busca    ?? "",
      cargo:    filtros.cargo    ?? "",
      partido:  filtros.partido  ?? "",
      uf:       filtros.uf       ?? "",
      situacao: filtros.situacao ?? "",
      ano:      filtros.ano      ?? "",
      page:     String(page),
      per_page: String(perPage),
    });
  },

  async buscarCandidato(id: number): Promise<Candidato> {
    return get(`/candidatos/${id}`);
  },

  async estatisticas(ano?: string, uf?: string): Promise<Estatisticas> {
    return get("/candidatos/estatisticas", { ano: ano ?? "", uf: uf ?? "" });
  },

  async listarCargos(): Promise<string[]> {
    return get("/candidatos/cargos");
  },

  // Partidos
  async listarPartidos(): Promise<Partido[]> {
    return get("/partidos/");
  },

  // Notícias
  async noticiasDoCandidat(id: number): Promise<Noticia[]> {
    return get(`/noticias/${id}`);
  },

  async sincronizarNoticias(id: number): Promise<Noticia[]> {
    return post(`/noticias/${id}/sincronizar`);
  },

  // Sync TSE
  async sincronizarTSE(ano: number, uf?: string): Promise<{ mensagem: string }> {
    return post("/sync/tse", { ano: String(ano), uf: uf ?? "" });
  },
};
