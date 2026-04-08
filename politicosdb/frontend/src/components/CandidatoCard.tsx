import { Link } from "react-router-dom";
import type { Candidato } from "../utils/types";

const PARTIDO_CORES: Record<string, { bg: string; text: string }> = {
  PT:           { bg: "#FAECE7", text: "#D85A30" },
  PL:           { bg: "#E6F1FB", text: "#185FA5" },
  MDB:          { bg: "#E1F5EE", text: "#1D9E75" },
  PSOL:         { bg: "#FAEEDA", text: "#BA7517" },
  PSD:          { bg: "#EEEDFE", text: "#533AB7" },
  PSB:          { bg: "#FBEAF0", text: "#D4537E" },
  PDT:          { bg: "#E1F5EE", text: "#0F6E56" },
  União:        { bg: "#FAC775", text: "#412402" },
  Rede:         { bg: "#EAF3DE", text: "#3B6D11" },
  Solidariedade:{ bg: "#FAECE7", text: "#993C1D" },
};

function getInitials(nome: string) {
  return nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function getPartidoCor(sigla: string) {
  return PARTIDO_CORES[sigla] ?? { bg: "#F1EFE8", text: "#888780" };
}

function situacaoClass(s?: string) {
  const lower = s?.toLowerCase() ?? "";
  if (lower === "eleito" || lower === "eleita") return "tag-eleito";
  if (lower === "suplente") return "tag-suplente";
  return "tag-nao-eleito";
}

interface Props {
  candidato: Candidato;
}

export default function CandidatoCard({ candidato: c }: Props) {
  const cor = getPartidoCor(c.partido?.sigla ?? "");

  return (
    <div className="card flex flex-col gap-3">
      {/* Topo */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: cor.bg, color: cor.text }}
        >
          {getInitials(c.nome)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{c.nome}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {c.cargo} · {c.municipio ?? c.uf}/{c.uf}
          </p>
        </div>
        {c.partido && (
          <span
            className="font-mono text-[10px] px-2 py-0.5 rounded flex-shrink-0"
            style={{ background: cor.bg, color: cor.text }}
          >
            {c.partido.sigla}
          </span>
        )}
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
        {[
          { label: "Nº", val: c.numero_candidato },
          { label: "Ano", val: c.ano_eleicao },
          { label: "Votos", val: c.votos?.toLocaleString("pt-BR") ?? "—" },
          { label: "Idade", val: c.idade ? `${c.idade} anos` : "—" },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="font-mono text-[9px] uppercase text-gray-400">{label}</p>
            <p className="text-xs font-medium">{val}</p>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div className="flex items-center gap-2 pt-1">
        <span className={situacaoClass(c.situacao)}>{c.situacao ?? "—"}</span>
        <Link
          to={`/candidato/${c.id}`}
          className="ml-auto text-xs text-gray-400 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          Ver mais
        </Link>
      </div>
    </div>
  );
}
