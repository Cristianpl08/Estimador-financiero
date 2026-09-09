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
import { Info, ChevronRight } from "lucide-react";
import { Field, NumberInput, Select, StatCard, SourceLink } from "./ui.jsx";
import { fmtCOP, cuotaFrancesa, saldoPendiente, valorFuturoInmueble } from "../utils/finance.js";
import {
  SMMLV_2026,
  TOPES_VIVIENDA,
  BANCOS,
  CUOTA_INICIAL_OPCIONES,
  SUBSIDIOS,
  PLAZOS,
  AÑOS_HITO,
  VALORIZACION_DEFAULT,
  VALORIZACION_NOTA,
  VALORIZACION_FUENTE,
  PERFILES_ARRIENDO,
  CANON_MAXIMO_LEGAL_MENSUAL_PCT,
  RENTABILIDAD_ARRIENDO_FUENTE,
} from "../data/constants.js";

export default function CaminoVivienda() {
  const [valor, setValor] = useState(250000000);
  const [cuotaOpcion, setCuotaOpcion] = useState("30");
  const [cuotaCustom, setCuotaCustom] = useState(25);
  const [bancoId, setBancoId] = useState("bancolombia");
  const [tasaCustom, setTasaCustom] = useState(13);
  const [plazo, setPlazo] = useState(20);
  const [subsidioId, setSubsidioId] = useState("ninguno");
  const [subsidioCustom, setSubsidioCustom] = useState(0);

  const [financiarInicial, setFinanciarInicial] = useState(false);
  const [modoFinanciacion, setModoFinanciacion] = useState("constructora"); // constructora | credito
  const [mesesConstructora, setMesesConstructora] = useState(24);
  const [tasaCuotaInicial, setTasaCuotaInicial] = useState(15);
  const [mesesCredito, setMesesCredito] = useState(24);

  const [valorizacion, setValorizacion] = useState(VALORIZACION_DEFAULT);
  const [perfilArriendoId, setPerfilArriendoId] = useState("promedio");
  const [yieldCustom, setYieldCustom] = useState(6);

  const cuotaPct =
    cuotaOpcion === "custom" ? cuotaCustom : CUOTA_INICIAL_OPCIONES.find((o) => o.id === cuotaOpcion).value;

  const banco = BANCOS.find((b) => b.id === bancoId);
  const tasaEA = banco.id === "custom" ? tasaCustom : banco.rate;

  const subsidio = SUBSIDIOS.find((s) => s.id === subsidioId);
  const subsidioValor = subsidio.id === "custom" ? subsidioCustom : subsidio.amount;

  const calc = useMemo(() => {
    const cuotaInicialTotal = (valor * cuotaPct) / 100;
    const aportePropio = Math.max(0, cuotaInicialTotal - subsidioValor);
    const montoCredito = valor - cuotaInicialTotal;
    const cuotaHipoteca = cuotaFrancesa(montoCredito, tasaEA, plazo * 12);
    const totalPagadoCredito = cuotaHipoteca * plazo * 12;
    const interesesCredito = totalPagadoCredito - montoCredito;

    let cuotaFaseInicial = 0;
    if (financiarInicial) {
      cuotaFaseInicial =
        modoFinanciacion === "constructora"
          ? aportePropio / Math.max(1, mesesConstructora)
          : cuotaFrancesa(aportePropio, tasaCuotaInicial, mesesCredito);
    }

    return {
      cuotaInicialTotal,
      aportePropio,
      montoCredito,
      cuotaHipoteca,
      totalPagadoCredito,
      interesesCredito,
      cuotaFaseInicial,
    };
  }, [
    valor,
    cuotaPct,
    subsidioValor,
    tasaEA,
    plazo,
    financiarInicial,
    modoFinanciacion,
    mesesConstructora,
    tasaCuotaInicial,
    mesesCredito,
  ]);

  const mesesFase1 = financiarInicial ? (modoFinanciacion === "constructora" ? mesesConstructora : mesesCredito) : 0;
  const totalAñosProceso = plazo + mesesFase1 / 12;

  const pctSubsidio = valor ? (Math.min(subsidioValor, calc.cuotaInicialTotal) / valor) * 100 : 0;
  const pctPropio = valor ? (calc.aportePropio / valor) * 100 : 0;
  const pctCredito = valor ? (calc.montoCredito / valor) * 100 : 0;

  // Valorización del inmueble + patrimonio neto (valor - saldo del crédito) en el tiempo.
  const patrimonioFilas = useMemo(
    () =>
      AÑOS_HITO.map((años) => {
        const valorProyectado = valorFuturoInmueble(valor, valorizacion, años);
        const saldo = saldoPendiente(calc.montoCredito, tasaEA, plazo * 12, años * 12);
        return { años, valorProyectado, saldo, patrimonio: valorProyectado - saldo };
      }),
    [valor, valorizacion, calc.montoCredito, tasaEA, plazo]
  );

  const curvaPatrimonio = useMemo(() => {
    const puntos = [];
    for (let y = 0; y <= 40; y++) {
      const valorProyectado = valorFuturoInmueble(valor, valorizacion, y);
      const saldo = saldoPendiente(calc.montoCredito, tasaEA, plazo * 12, y * 12);
      puntos.push({ año: y, patrimonio: valorProyectado - saldo });
    }
    return puntos;
  }, [valor, valorizacion, calc.montoCredito, tasaEA, plazo]);

  // Estimado de arriendo si decides rentarlo en vez de vivirlo.
  const perfilArriendo = PERFILES_ARRIENDO.find((p) => p.id === perfilArriendoId);
  const yieldAnual = perfilArriendo.id === "custom" ? yieldCustom : perfilArriendo.yieldAnual;
  const canonMensual = (valor * (yieldAnual / 100)) / 12;
  const canonMaximoLegal = valor * (CANON_MAXIMO_LEGAL_MENSUAL_PCT / 100);
  const flujoMensualArriendo = canonMensual - calc.cuotaHipoteca;

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      {/* -------- columna de inputs -------- */}
      <div className="space-y-4">
        <Field label="Valor del apartamento">
          <NumberInput value={valor} onChange={setValor} prefix="$" />
        </Field>

        <Field label="Cuota inicial requerida">
          <Select
            value={cuotaOpcion}
            onChange={setCuotaOpcion}
            options={CUOTA_INICIAL_OPCIONES}
            renderLabel={(o) => o.label}
          />
          {cuotaOpcion === "custom" && (
            <div className="mt-2">
              <NumberInput value={cuotaCustom} onChange={setCuotaCustom} prefix="%" />
            </div>
          )}
        </Field>

        <Field label="Banco / tasa de interés (E.A.)">
          <Select value={bancoId} onChange={setBancoId} options={BANCOS} renderLabel={(o) => o.label} />
          {banco.id === "custom" ? (
            <div className="mt-2">
              <NumberInput value={tasaCustom} onChange={setTasaCustom} prefix="%" />
            </div>
          ) : (
            <span className="block text-xs text-stone-400 mt-1">
              {banco.rate}% E.A. · {banco.tag}
            </span>
          )}
        </Field>

        <Field label="Plazo del crédito">
          <div className="grid grid-cols-5 gap-1.5">
            {PLAZOS.map((p) => (
              <button
                key={p}
                onClick={() => setPlazo(p)}
                className={`rounded-md border py-2 text-sm font-medium transition-colors ${
                  plazo === p
                    ? "border-amber-700 bg-amber-700 text-white"
                    : "border-stone-300 text-stone-600 hover:border-amber-400"
                }`}
              >
                {p}a
              </button>
            ))}
          </div>
        </Field>

        <Field label="Valorización anual esperada del inmueble">
          <NumberInput value={valorizacion} onChange={setValorizacion} prefix="%" />
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="text-stone-400">{VALORIZACION_NOTA}</span>
          </div>
          <SourceLink href={VALORIZACION_FUENTE}>fuente</SourceLink>
        </Field>

        <Field label="Subsidio de vivienda">
          <Select value={subsidioId} onChange={setSubsidioId} options={SUBSIDIOS} renderLabel={(o) => o.label} />
          {subsidio.id === "custom" ? (
            <div className="mt-2">
              <NumberInput value={subsidioCustom} onChange={setSubsidioCustom} prefix="$" />
            </div>
          ) : (
            subsidio.amount > 0 && (
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-stone-400">{subsidio.note}</span>
                {subsidio.link && <SourceLink href={subsidio.link}>detalles</SourceLink>}
              </div>
            )
          )}
        </Field>

        <div className="rounded-lg border border-stone-200 p-3">
          <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={financiarInicial}
              onChange={(e) => setFinanciarInicial(e.target.checked)}
              className="rounded"
            />
            Necesito financiar la cuota inicial
          </label>

          {financiarInicial && (
            <div className="mt-3 space-y-3 pl-1">
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setModoFinanciacion("constructora")}
                  className={`px-2.5 py-1.5 rounded-md border ${
                    modoFinanciacion === "constructora"
                      ? "border-amber-700 bg-amber-50 text-amber-800"
                      : "border-stone-300 text-stone-500"
                  }`}
                >
                  Plan constructora (0% interés)
                </button>
                <button
                  onClick={() => setModoFinanciacion("credito")}
                  className={`px-2.5 py-1.5 rounded-md border ${
                    modoFinanciacion === "credito"
                      ? "border-amber-700 bg-amber-50 text-amber-800"
                      : "border-stone-300 text-stone-500"
                  }`}
                >
                  Crédito con interés
                </button>
              </div>

              {modoFinanciacion === "constructora" ? (
                <Field label="Meses para pagarla (mientras se construye)">
                  <NumberInput value={mesesConstructora} onChange={setMesesConstructora} />
                </Field>
              ) : (
                <>
                  <Field label="Tasa E.A. del crédito para la cuota inicial">
                    <NumberInput value={tasaCuotaInicial} onChange={setTasaCuotaInicial} prefix="%" />
                  </Field>
                  <Field label="Plazo en meses">
                    <NumberInput value={mesesCredito} onChange={setMesesCredito} />
                  </Field>
                </>
              )}
            </div>
          )}
        </div>

        <Field label="Si lo arrendaras: perfil de rentabilidad">
          <Select
            value={perfilArriendoId}
            onChange={setPerfilArriendoId}
            options={PERFILES_ARRIENDO}
            renderLabel={(o) => o.label}
          />
          {perfilArriendo.id === "custom" ? (
            <div className="mt-2">
              <NumberInput value={yieldCustom} onChange={setYieldCustom} prefix="%" />
            </div>
          ) : (
            <span className="block text-xs text-stone-400 mt-1">
              {perfilArriendo.yieldAnual}% anual bruto · {perfilArriendo.note}
            </span>
          )}
        </Field>
      </div>

      {/* -------- columna de resultados -------- */}
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <StatCard label="Necesitas de cuota inicial" value={fmtCOP(calc.cuotaInicialTotal)} accent="#92400e" big />
          <StatCard label="Después del subsidio, pones tú" value={fmtCOP(calc.aportePropio)} accent="#92400e" big />
          <StatCard label="Monto a financiar (crédito)" value={fmtCOP(calc.montoCredito)} />
          <StatCard label="Cuota mensual del crédito" value={fmtCOP(calc.cuotaHipoteca)} accent="#92400e" big />
        </div>

        {/* composición */}
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-stone-400 mb-2">Cómo se compone el valor total</div>
          <div className="h-6 w-full rounded-full overflow-hidden flex text-[10px] text-white font-medium">
            {pctSubsidio > 0 && (
              <div
                style={{ width: `${pctSubsidio}%`, background: "#059669" }}
                className="flex items-center justify-center"
              >
                {pctSubsidio > 6 && "Subsidio"}
              </div>
            )}
            <div style={{ width: `${pctPropio}%`, background: "#b45309" }} className="flex items-center justify-center">
              {pctPropio > 6 && "Tu aporte"}
            </div>
            <div style={{ width: `${pctCredito}%`, background: "#57534e" }} className="flex items-center justify-center">
              {pctCredito > 6 && "Crédito"}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-stone-500">
            {subsidioValor > 0 && <span>🟢 Subsidio: {fmtCOP(Math.min(subsidioValor, calc.cuotaInicialTotal))}</span>}
            <span>🟤 Tu aporte: {fmtCOP(calc.aportePropio)}</span>
            <span>⚫ Crédito: {fmtCOP(calc.montoCredito)}</span>
          </div>
        </div>

        {/* linea de tiempo del proceso */}
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-stone-400 mb-3">
            Línea de tiempo hasta ser dueño sin deudas
          </div>
          <div className="flex items-stretch gap-0">
            {financiarInicial && (
              <>
                <div className="flex-1 border-r border-dashed border-stone-300 pr-3">
                  <div className="text-xs text-stone-400 mb-1">Fase 1 · {mesesFase1} meses</div>
                  <div className="text-sm font-semibold text-amber-800">{fmtCOP(calc.cuotaFaseInicial)} / mes</div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {modoFinanciacion === "constructora"
                      ? "pagando la cuota inicial a la constructora"
                      : "crédito para la cuota inicial"}
                  </div>
                </div>
                <ChevronRight className="text-stone-300 self-center mx-2 shrink-0" size={18} />
              </>
            )}
            <div className="flex-1 pl-1">
              <div className="text-xs text-stone-400 mb-1">
                Fase {financiarInicial ? 2 : 1} · {plazo} años
              </div>
              <div className="text-sm font-semibold text-amber-800">{fmtCOP(calc.cuotaHipoteca)} / mes</div>
              <div className="text-xs text-stone-400 mt-0.5">pagando el crédito hipotecario</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-sm text-stone-600">
            Tiempo total aproximado:{" "}
            <span className="font-semibold text-stone-800">{totalAñosProceso.toFixed(1)} años</span>
            {" · "}Intereses del crédito hipotecario:{" "}
            <span className="font-semibold text-stone-800">{fmtCOP(calc.interesesCredito)}</span>
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex gap-2">
          <Info size={15} className="shrink-0 mt-0.5" />
          <span>
            Aparte de la cuota inicial, guarda un 3%–4% adicional del valor del inmueble para gastos de escritura,
            registro y notariales — el banco no financia esa parte.
          </span>
        </div>

        {/* valorización y patrimonio */}
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-stone-400 mb-2">
            Valorización del inmueble y patrimonio neto
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={curvaPatrimonio} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="patrimonio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b45309" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#b45309" stopOpacity={0.02} />
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
              <Area type="monotone" dataKey="patrimonio" stroke="#b45309" strokeWidth={2.5} fill="url(#patrimonio)" />
            </AreaChart>
          </ResponsiveContainer>

          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="text-stone-400 text-xs uppercase tracking-wide">
                <th className="text-left py-1.5 font-medium">Años</th>
                <th className="text-right py-1.5 font-medium">Valor proyectado</th>
                <th className="text-right py-1.5 font-medium">Saldo del crédito</th>
                <th className="text-right py-1.5 font-medium">Patrimonio neto</th>
              </tr>
            </thead>
            <tbody>
              {patrimonioFilas.map((f) => (
                <tr key={f.años} className="border-t border-stone-100">
                  <td className="py-1.5 text-stone-700 font-medium">{f.años}</td>
                  <td className="py-1.5 text-right text-stone-500">{fmtCOP(f.valorProyectado)}</td>
                  <td className="py-1.5 text-right text-stone-500">{fmtCOP(f.saldo)}</td>
                  <td className="py-1.5 text-right font-semibold" style={{ color: "#92400e" }}>
                    {fmtCOP(f.patrimonio)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs text-stone-400 mt-2">
            Patrimonio neto = valor proyectado del inmueble − lo que aún debes del crédito en ese año. Comparable con
            el "Total acumulado" de la pestaña Ahorrar e invertir.
          </div>
        </div>

        {/* arriendo estimado */}
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-stone-400 mb-3">Si decides arrendarlo</div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <StatCard label="Canon mensual estimado" value={fmtCOP(canonMensual)} accent="#92400e" big />
            <StatCard label="Rentabilidad bruta anual" value={`${yieldAnual}%`} />
          </div>
          <div className="text-sm text-stone-600">
            {financiarInicial ? "Durante la fase del crédito hipotecario, tu" : "Tu"} flujo mensual arrendándolo
            frente a la cuota del crédito sería{" "}
            <span className="font-semibold" style={{ color: flujoMensualArriendo >= 0 ? "#065f46" : "#b91c1c" }}>
              {flujoMensualArriendo >= 0 ? "+" : ""}
              {fmtCOP(flujoMensualArriendo)} / mes
            </span>
            {flujoMensualArriendo >= 0
              ? " — el arriendo alcanzaría a cubrir la cuota del crédito."
              : " — el arriendo no alcanzaría a cubrir la cuota del crédito; tendrías que poner la diferencia."}
          </div>
          <div className="text-xs text-stone-400 mt-2">
            Tope legal en Colombia: el canon no puede superar el {CANON_MAXIMO_LEGAL_MENSUAL_PCT}% mensual del valor
            comercial del inmueble ({fmtCOP(canonMaximoLegal)}/mes en este caso). No incluye administración, predial
            ni mantenimiento, que corren por cuenta del propietario.{" "}
            <SourceLink href={RENTABILIDAD_ARRIENDO_FUENTE}>fuente</SourceLink>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4 text-xs text-stone-500 space-y-1.5">
          <div className="text-stone-400 uppercase tracking-wide text-[11px] mb-1">Referencia 2026</div>
          <div>
            SMMLV: {fmtCOP(SMMLV_2026)} · Tope VIP (90 SMMLV): {fmtCOP(TOPES_VIVIENDA.vip)} · Tope VIS (135 SMMLV):{" "}
            {fmtCOP(TOPES_VIVIENDA.vis)}
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <SourceLink href="https://vivienda.com.co/creditos-hipotecarios-colombia-tasas-vivienda-2026/">
              Tasas hipotecarias 2026
            </SourceLink>
            <SourceLink href="https://www.lahaus.com/herramientas/simulador-calcula-cuota-inicial">
              Cuota inicial
            </SourceLink>
            <SourceLink href="https://www.portafolio.co/mis-finanzas/vivienda/subsidios-de-vivienda-vigentes-en-2026-cajas-de-compensacion-y-programas-locales-tras-mi-casa-ya-485814">
              Subsidios vigentes
            </SourceLink>
          </div>
        </div>
      </div>
    </div>
  );
}
