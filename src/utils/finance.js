export const fmtCOP = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));

// Convierte una tasa efectiva anual (%) a tasa mensual equivalente.
export const eaToMonthly = (eaPercent) => Math.pow(1 + eaPercent / 100, 1 / 12) - 1;

// Valor futuro de un aporte inicial + aportes mensuales, con
// capitalización mensual equivalente a la tasa E.A. dada.
export function fvSeries(aporteInicial, aporteMensual, eaPercent, meses) {
  const i = eaToMonthly(eaPercent);
  if (i === 0) return aporteInicial + aporteMensual * meses;
  return aporteInicial * Math.pow(1 + i, meses) + aporteMensual * ((Math.pow(1 + i, meses) - 1) / i);
}

// Cuota fija de un crédito bajo el sistema francés de amortización.
export function cuotaFrancesa(principal, eaPercent, meses) {
  const i = eaToMonthly(eaPercent);
  if (i === 0) return principal / meses;
  return (principal * i) / (1 - Math.pow(1 + i, -meses));
}

// Saldo pendiente de un crédito francés después de `mesesTranscurridos` cuotas
// pagadas, dado un plazo total `mesesPlazoTotal`. Si ya se pagó todo, da 0.
export function saldoPendiente(principal, eaPercent, mesesPlazoTotal, mesesTranscurridos) {
  const k = Math.min(Math.max(mesesTranscurridos, 0), mesesPlazoTotal);
  if (k <= 0) return principal;
  if (k >= mesesPlazoTotal) return 0;
  const i = eaToMonthly(eaPercent);
  const pmt = cuotaFrancesa(principal, eaPercent, mesesPlazoTotal);
  if (i === 0) return Math.max(0, principal - pmt * k);
  const balance = principal * Math.pow(1 + i, k) - pmt * ((Math.pow(1 + i, k) - 1) / i);
  return Math.max(0, balance);
}

// Valor futuro de un inmueble con valorización anual compuesta.
export function valorFuturoInmueble(valorHoy, valorizacionEA, años) {
  return valorHoy * Math.pow(1 + valorizacionEA / 100, años);
}
