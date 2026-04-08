import { useState } from "react";
import { useCandidatos } from "../hooks/useCandidatos";
import StatCard from "../components/StatCard";
import FiltrosPanel from "../components/FiltrosPanel";
import CandidatoCard from "../components/CandidatoCard";
import type { Candidato } from "../utils/types";
import { Link } from "react-router-dom";

type View = "cards" | "lista";

export default function HomePage() {
  const {
    candidatos, total, page, pages, setPage,
    filtros, setFiltro, limparFiltros,
    estatisticas, cargos, partidos,
    loading, erro,
  } = useCandidatos();

  const [view, setView] = useState<View>("cards");

  return (
    <div>
      {/* Header da página */}
      <div className="border-b border-gray-200 pb-4 mb-5">
        <h1 className="text-3xl font-black tracking-tight">
          Políticos<span className="text-green">DB</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Base de dados de candidatos e eleitos das eleições brasileiras
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs bg-blue-light text-blue px-2 py-1 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse inline-block" />
          Dados via API TSE · Portais de notícias
        </div>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <StatCard label="Candidatos" value={estatisticas.total}    cor="green" />
          <StatCard label="Eleitos"    value={estatisticas.eleitos}  cor="amber" />
          <StatCard label="Partidos"   value={estatisticas.partidos} cor="coral" />
          <StatCard label="Estados"    value={estatisticas.estados}  cor="blue"  />
        </div>
      )}

      {/* Filtros */}
      <FiltrosPanel
        filtros={filtros}
        cargos={cargos}
        partidos={partidos}
        onFiltro={setFiltro}
        onLimpar={limparFiltros}
      />

      {/* Barra de resultados */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-gray-400">
          {loading ? "Carregando..." : `${total.toLocaleString("pt-BR")} resultado${total !== 1 ? "s" : ""}`}
        </span>
        <div className="flex gap-1.5">
          {(["cards", "lista"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                view === v
                  ? "bg-green-light border-green text-green-dark"
                  : "border-gray-200 text-gray-400 hover:bg-gray-100"
              }`}
            >
              {v === "cards" ? "Cards" : "Lista"}
            </button>
          ))}
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {erro}
        </div>
      )}

      {/* Resultados */}
      {!loading && candidatos.length === 0 && !erro && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">Nenhum candidato encontrado com esses filtros.</p>
        </div>
      )}

      {view === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {candidatos.map((c) => <CandidatoCard key={c.id} candidato={c} />)}
        </div>
      ) : (
        <TabelaLista candidatos={candidatos} />
      )}

      {/* Paginação */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn-outline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <span className="font-mono text-xs text-gray-500">
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pages}
            className="btn-outline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}

function TabelaLista({ candidatos }: { candidatos: Candidato[] }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {["Nome", "Cargo", "Partido", "UF", "Votos", "Situação", ""].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left font-mono text-[10px] uppercase text-gray-400 tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidatos.map((c, i) => (
            <tr key={c.id} className={`border-t border-gray-100 ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
              <td className="px-4 py-2.5 font-semibold">{c.nome}</td>
              <td className="px-4 py-2.5 text-gray-500">{c.cargo}</td>
              <td className="px-4 py-2.5">
                {c.partido && (
                  <span className="font-mono text-[10px] bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                    {c.partido.sigla}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 text-gray-500">{c.uf}</td>
              <td className="px-4 py-2.5 font-mono text-xs">
                {c.votos?.toLocaleString("pt-BR") ?? "—"}
              </td>
              <td className="px-4 py-2.5">
                <span className={`tag-${c.situacao?.toLowerCase() === "eleito" || c.situacao?.toLowerCase() === "eleita" ? "eleito" : "nao-eleito"}`}>
                  {c.situacao ?? "—"}
                </span>
              </td>
              <td className="px-4 py-2.5">
                <Link to={`/candidato/${c.id}`} className="text-xs text-gray-400 hover:text-green transition-colors">
                  Ver →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
