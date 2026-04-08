export interface Partido {
  id: number;
  sigla: string;
  nome: string;
  numero?: number;
  cor_hex?: string;
}

export interface Candidato {
  id: number;
  nome: string;
  nome_urna?: string;
  numero_candidato: number;
  cargo: string;
  partido?: Partido;
  uf: string;
  municipio?: string;
  ano_eleicao: number;
  turno?: number;
  situacao?: string;
  votos?: number;
  percentual_votos?: number;
  genero?: string;
  idade?: number;
  instrucao?: string;
  patrimonio_declarado?: number;
  foto_url?: string;
  bio?: string;
  // detalhe apenas
  cpf?: string;
  ocupacao?: string;
  email?: string;
  data_nascimento?: string;
}

export interface Noticia {
  id: number;
  titulo: string;
  url?: string;
  fonte?: string;
  publicado_em?: string;
  resumo?: string;
}

export interface Estatisticas {
  total: number;
  eleitos: number;
  partidos: number;
  estados: number;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  per_page: number;
  pages: number;
  data: T[];
}

export interface Filtros {
  busca: string;
  cargo: string;
  partido: string;
  uf: string;
  situacao: string;
  ano: string;
}
