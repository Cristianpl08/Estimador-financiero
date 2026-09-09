import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Info } from "lucide-react";
import { Field, NumberInput } from "./ui.jsx";
import { fmtCOP, fvSeries } from "../utils/finance.js";
import { AÑOS_HITO } from "../data/constants.js";

export default function CaminoAhorro() {
  const [aporteInicial, setAporteInicial] = useState(0);
  const [aporteMensual, setAporteMensual] = useState(1000000);
  const [tasaEA, setTasaEA] = useState(10);

  const filas = useMemo(
    () =>
      AÑOS_HITO.map((años) => {
        const meses = años * 12;
        const total = fvSeries(aporteInicial, aporteMensual, tasaEA, meses);
        const aportado = aporteInicial + aporteMensual * meses;
        return { años, total, aportado, rendimiento: total - aportado };
      }),
    [aporteInicial, aporteMensual, tasaEA]
  );

  const curva = useMemo(() => {
    const puntos = [];
    for (let y = 0; y <= 40; y++) {
      puntos.push({ año: y, valor: fvSeries(aporteInicial, aporteMensual, tasaEA, y * 12) });
    }
    return puntos;
  }, [aporteInicial, aporteMensual, tasaEA]);

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      <div className="space-y-4">
        <Field label="Ya tienes ahorrado (hoy)">
          <NumberInput value={aporteInicial} onChange={setAporteInicial} prefix="$" />
        </Field>
        <Field label="Aporte mensual" hint="lo que vas a guardar cada mes">
          <NumberInput value={aporteMensual} onChange={setAporteMensual} prefix="$" />
        </Field>
        <Field label="Rentabilidad efectiva anual (E.A.)" hint="el % que te paga donde inviertas ese dinero">
          <NumberInput value={tasaEA} onChange={setTasaEA} prefix="%" />
        </Field>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 flex gap-2">
          <Info size={15} className="shrink-0 mt-0.5" />
          <span>
            El cálculo usa interés compuesto mensual equivalente a tu tasa E.A.: cada mes se suma tu aporte y se
            capitaliza lo acumulado.
          </span>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={curva} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="camino" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="año" tickFormatter={(v) => `${v}a`} tick={{ fontSize: 11, fill: "#78716c" }} />
              <YAxis
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                tick={{ fontSize: 11, fill: "#78716c" }}
                width={44}
              />
              <Tooltip
                formatter={(v) => fmtCOP(v)}
                labelFormatter={(l) => `Año ${l}`}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Area type="monotone" dataKey="valor" stroke="#059669" strokeWidth={2.5} fill="url(#camino)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2.5 font-medium">Años</th>
                <th className="text-right px-4 py-2.5 font-medium">Total acumulado</th>
                <th className="text-right px-4 py-2.5 font-medium">Aportado por ti</th>
                <th className="text-right px-4 py-2.5 font-medium">Rendimiento generado</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.años} className="border-t border-stone-100">
                  <td className="px-4 py-2.5 text-stone-700 font-medium">{f.años}</td>
                  <td className="px-4 py-2.5 text-right font-semibold" style={{ color: "#065f46" }}>
                    {fmtCOP(f.total)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-stone-500">{fmtCOP(f.aportado)}</td>
                  <td className="px-4 py-2.5 text-right text-stone-500">{fmtCOP(f.rendimiento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
