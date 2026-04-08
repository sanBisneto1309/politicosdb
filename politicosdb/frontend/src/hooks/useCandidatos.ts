import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import type { Candidato, Filtros, Estatisticas } from "../utils/types";

const FILTROS_INIT: Filtros = {
  busca: "", cargo: "", partido: "", uf: "", situacao: "", ano: "",
};

export function useCandidatos() {
  const [candidatos, setCandidatos]     = useState<Candidato[]>([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [pages, setPages]               = useState(1);
  const [filtros, setFiltros]           = useState<Filtros>(FILTROS_INIT);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [cargos, setCargos]             = useState<string[]>([]);
  const [partidos, setPartidos]         = useState<string[]>([]);
  const [loading, setLoading]           = useState(false);
  const [erro, setErro]                 = useState<string | null>(null);

  const buscar = useCallback(async (f: Filtros, p: number) => {
    setLoading(true);
    setErro(null);
    try {
      const [res, stats] = await Promise.all([
        api.listarCandidatos(f, p),
        api.estatisticas(f.ano, f.uf),
      ]);
      setCandidatos(res.data);
      setTotal(res.total);
      setPages(res.pages);
      setEstatisticas(stats);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega filtros auxiliares na montagem
  useEffect(() => {
    (async () => {
      try {
        const [c, ps] = await Promise.all([
          api.listarCargos(),
          api.listarPartidos(),
        ]);
        setCargos(c);
        setPartidos(ps.map((p) => p.sigla));
      } catch {
        // falha silenciosa — filtros auxiliares
      }
    })();
  }, []);

  // Re-busca sempre que filtros ou página mudam
  useEffect(() => {
    buscar(filtros, page);
  }, [filtros, page, buscar]);

  const setFiltro = (campo: keyof Filtros, valor: string) => {
    setPage(1);
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const limparFiltros = () => {
    setPage(1);
    setFiltros(FILTROS_INIT);
  };

  return {
    candidatos,
    total,
    page,
    pages,
    setPage,
    filtros,
    setFiltro,
    limparFiltros,
    estatisticas,
    cargos,
    partidos,
    loading,
    erro,
  };
}
