import type { Filtros } from "../utils/types";

const UFS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA",
  "MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN",
  "RO","RR","RS","SC","SE","SP","TO",
];

interface Props {
  filtros: Filtros;
  cargos: string[];
  partidos: string[];
  onFiltro: (campo: keyof Filtros, valor: string) => void;
  onLimpar: () => void;
}

export default function FiltrosPanel({ filtros, cargos, partidos, onFiltro, onLimpar }: Props) {
  return (
    <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 mb-5">
      <p className="font-mono text-[10px] uppercase text-gray-400 tracking-wide mb-3">Filtros</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 items-end">
        {/* Busca */}
        <div className="lg:col-span-2 flex flex-col gap-1">
          <label className="text-[11px] text-gray-500 font-medium">Busca</label>
          <input
            type="text"
            placeholder="Nome ou número..."
            value={filtros.busca}
            onChange={(e) => onFiltro("busca", e.target.value)}
            className="h-9 text-sm px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green transition-colors"
          />
        </div>

        {/* Cargo */}
        <Sel label="Cargo" value={filtros.cargo} onChange={(v) => onFiltro("cargo", v)}>
          <option value="">Todos</option>
          {cargos.map((c) => <option key={c}>{c}</option>)}
        </Sel>

        {/* Partido */}
        <Sel label="Partido" value={filtros.partido} onChange={(v) => onFiltro("partido", v)}>
          <option value="">Todos</option>
          {partidos.map((p) => <option key={p}>{p}</option>)}
        </Sel>

        {/* UF */}
        <Sel label="Estado (UF)" value={filtros.uf} onChange={(v) => onFiltro("uf", v)}>
          <option value="">Todos</option>
          {UFS.map((u) => <option key={u}>{u}</option>)}
        </Sel>

        {/* Situação */}
        <Sel label="Situação" value={filtros.situacao} onChange={(v) => onFiltro("situacao", v)}>
          <option value="">Todas</option>
          <option>Eleito</option>
          <option>Não eleito</option>
          <option>Suplente</option>
        </Sel>

        {/* Ano */}
        <Sel label="Ano" value={filtros.ano} onChange={(v) => onFiltro("ano", v)}>
          <option value="">Todos</option>
          <option>2024</option>
          <option>2022</option>
          <option>2020</option>
        </Sel>
      </div>

      <div className="mt-3 flex justify-end">
        <button onClick={onLimpar} className="btn-outline text-xs">
          Limpar filtros
        </button>
      </div>
    </div>
  );
}

function Sel({
  label, value, onChange, children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-gray-500 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-sm px-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-green transition-colors"
      >
        {children}
      </select>
    </div>
  );
}
