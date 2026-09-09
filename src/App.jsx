import React, { useState } from "react";
import { TrendingUp, Home } from "lucide-react";
import CaminoAhorro from "./components/CaminoAhorro.jsx";
import CaminoVivienda from "./components/CaminoVivienda.jsx";

export default function App() {
  const [tab, setTab] = useState("ahorro");

  return (
    <div className="min-h-full w-full bg-stone-50 text-stone-800 font-body">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <header className="mb-7">
          <h1 className="text-3xl text-stone-900 mb-1.5 font-display font-semibold">Dos caminos</h1>
          <p className="text-stone-500 text-sm max-w-lg">
            Compara qué pasa si guardas tu dinero invertido, contra qué pasa si lo pones en un apartamento propio.
            Todo se calcula en tu navegador — si recargas la página, se reinicia.
          </p>
        </header>

        <div className="flex gap-2 mb-6 border-b border-stone-200">
          <button
            onClick={() => setTab("ahorro")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "ahorro"
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            <TrendingUp size={16} /> Ahorrar e invertir
          </button>
          <button
            onClick={() => setTab("vivienda")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "vivienda"
                ? "border-amber-700 text-amber-800"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            <Home size={16} /> Comprar apartamento
          </button>
        </div>

        {tab === "ahorro" ? <CaminoAhorro /> : <CaminoVivienda />}

        <footer className="mt-10 pt-5 border-t border-stone-200 text-xs text-stone-400">
          Simulador con fines informativos, no es asesoría financiera. Las tasas y subsidios cambian; verifica los
          valores vigentes con tu banco, tu caja de compensación o el Ministerio de Vivienda antes de decidir.
        </footer>
      </div>
    </div>
  );
}
