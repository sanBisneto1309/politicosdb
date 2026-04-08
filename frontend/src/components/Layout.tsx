import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-1">
            <span className="font-black text-2xl tracking-tight">
              Políticos<span className="text-green">DB</span>
            </span>
            <span className="font-mono text-xs bg-gray-100 border border-gray-200 text-gray-500 px-2 py-0.5 rounded ml-1">
              MVP v0.1
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-gray-500">
            <a
              href="https://dadosabertos.tse.jus.br"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green transition-colors flex items-center gap-1"
            >
              <span className="w-2 h-2 rounded-full bg-blue inline-block animate-pulse" />
              API TSE
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 mt-16 py-6 text-center text-xs text-gray-400 font-mono">
        PolíticosDB · Dados via TSE Dados Abertos · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
