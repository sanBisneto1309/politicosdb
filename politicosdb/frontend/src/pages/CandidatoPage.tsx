import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import type { Candidato, Noticia } from "../utils/types";

function fmt(v?: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR");
}

function fmtMoeda(v?: number | null) {
  if (v == null) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CandidatoPage() {
  const { id } = useParams<{ id: string }>();
  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [noticias, setNoticias]   = useState<Noticia[]>([]);
  const [loading, setLoading]     = useState(true);
  const [sincNot, setSincNot]     = useState(false);
  const [erro, setErro]           = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.buscarCandidato(Number(id)),
      api.noticiasDoCandidat(Number(id)),
    ])
      .then(([c, n]) => { setCandidato(c); setNoticias(n); })
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function sincronizarNoticias() {
    if (!id) return;
    setSincNot(true);
    try {
      const novas = await api.sincronizarNoticias(Number(id));
      setNoticias((prev) => [...novas, ...prev]);
    } catch {
      // silencioso
    } finally {
      setSincNot(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-400 py-8 text-center">Carregando...</p>;
  if (erro)    return <p className="text-sm text-red-500 py-8 text-center">{erro}</p>;
  if (!candidato) return null;

  const c = candidato;
  const isEleito = ["eleito","eleita"].includes(c.situacao?.toLowerCase() ?? "");

  return (
    <div className="max-w-3xl mx-auto">
      {/* Voltar */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-green transition-colors mb-6">
        ← Voltar à lista
      </Link>

      {/* Cabeçalho */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0"
            style={{ background: "#E1F5EE", color: "#1D9E75" }}
          >
            {c.nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black tracking-tight">{c.nome}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {c.cargo} · {c.municipio ?? c.uf}/{c.uf}
              {c.partido && (
                <span className="ml-2 font-mono text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                  {c.partido.sigla}
                </span>
              )}
            </p>
            {c.bio && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{c.bio}</p>}
          </div>
        </div>
      </div>

      {/* Grid de dados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Dados eleitorais */}
        <Section title="Dados eleitorais">
          <Row label="Número" val={c.numero_candidato} />
          <Row label="Ano" val={c.ano_eleicao} />
          <Row label="Votos" val={fmt(c.votos)} />
          <Row label="% Votos" val={c.percentual_votos != null ? `${c.percentual_votos}%` : "—"} />
          <Row label="Situação" val={
            <span className={isEleito ? "tag-eleito" : "tag-nao-eleito"}>
              {c.situacao ?? "—"}
            </span>
          } />
        </Section>

        {/* Perfil */}
        <Section title="Perfil">
          <Row label="Gênero"     val={c.genero === "F" ? "Feminino" : c.genero === "M" ? "Masculino" : "—"} />
          <Row label="Idade"      val={c.idade ? `${c.idade} anos` : "—"} />
          <Row label="Instrução"  val={c.instrucao ?? "—"} />
          <Row label="Ocupação"   val={c.ocupacao  ?? "—"} />
          <Row label="Patrimônio" val={fmtMoeda(c.patrimonio_declarado)} />
        </Section>
      </div>

      {/* Notícias */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] uppercase text-gray-400 tracking-wide">Notícias recentes</p>
          <button
            onClick={sincronizarNoticias}
            disabled={sincNot}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {sincNot ? "Buscando..." : "↻ Buscar via RSS"}
          </button>
        </div>

        {noticias.length === 0 ? (
          <p className="text-sm text-gray-400">
            Nenhuma notícia salva. Clique em "Buscar via RSS" para buscar nos portais.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {noticias.map((n) => (
              <div key={n.id} className="py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-gray-400">[{n.fonte}]</span>
                  {n.publicado_em && (
                    <span className="font-mono text-[10px] text-gray-400">
                      {new Date(n.publicado_em).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
                {n.url ? (
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:text-green transition-colors"
                  >
                    {n.titulo}
                  </a>
                ) : (
                  <p className="text-sm font-medium">{n.titulo}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <p className="font-mono text-[10px] uppercase text-gray-400 tracking-wide mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, val }: { label: string; val: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{val}</span>
    </div>
  );
}
