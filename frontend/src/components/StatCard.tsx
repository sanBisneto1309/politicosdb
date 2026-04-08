interface Props {
  label: string;
  value: number | string;
  cor?: "green" | "amber" | "coral" | "blue";
}

const CORES = {
  green: "text-green",
  amber: "text-amber",
  coral: "text-coral",
  blue:  "text-blue",
};

export default function StatCard({ label, value, cor = "green" }: Props) {
  return (
    <div className="stat-card">
      <p className="font-mono text-[10px] uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${CORES[cor]}`}>
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </p>
    </div>
  );
}
