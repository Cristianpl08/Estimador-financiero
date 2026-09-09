/**
 * DATOS DE REFERENCIA — COLOMBIA
 * Corte: agosto de 2026.
 *
 * Este es el ÚNICO archivo que debería tocarse cuando las tasas,
 * subsidios o topes cambien. Ver CLAUDE.md en la raíz del proyecto
 * para instrucciones de cómo y cuándo actualizarlo.
 */

export const SMMLV_2026 = 1750905;

export const TOPES_VIVIENDA = {
  vip: 90 * SMMLV_2026, // 157.581.450 — Vivienda de Interés Prioritario
  vis: 135 * SMMLV_2026, // 236.372.175 — Vivienda de Interés Social (general)
  visCiudadesPrincipales: 150 * SMMLV_2026, // 262.032.300 — VIS en ciudades principales
};

// Tasas efectivas anuales (E.A.) de crédito hipotecario por entidad.
// Fuente principal: Superintendencia Financiera / prensa económica, corte jun-jul 2026.
export const BANCOS = [
  { id: "fna", label: "Fondo Nacional del Ahorro (FNA)", rate: 10.9, tag: "VIS · la más baja" },
  { id: "agrario", label: "Banco Agrario", rate: 11.85, tag: "VIS" },
  { id: "cajasocial", label: "Banco Caja Social", rate: 12.39, tag: "VIS / No VIS" },
  { id: "bbva", label: "BBVA Colombia", rate: 12.59, tag: "VIS / No VIS" },
  { id: "davivienda", label: "Davivienda", rate: 14.4, tag: "No VIS" },
  { id: "bancolombia", label: "Bancolombia", rate: 14.94, tag: "No VIS" },
  { id: "bogota", label: "Banco de Bogotá", rate: 14.81, tag: "No VIS" },
  { id: "occidente", label: "Banco de Occidente", rate: 16.11, tag: "No VIS" },
  { id: "hipotecaria", label: "La Hipotecaria", rate: 16.45, tag: "No VIS" },
  { id: "custom", label: "Otra tasa (yo la escribo)", rate: null, tag: "" },
];

export const CUOTA_INICIAL_OPCIONES = [
  { id: "10", label: "10% — Leasing habitacional", value: 10, note: "financia hasta 90-100% del inmueble" },
  { id: "20", label: "20% — Crédito hipotecario VIS", value: 20, note: "habitual en vivienda de interés social" },
  { id: "30", label: "30% — Crédito hipotecario tradicional", value: 30, note: "el más común en No VIS" },
  { id: "custom", label: "Otro porcentaje", value: null, note: "" },
];

// Montos de subsidio en pesos. Los que dependen del SMMLV quedan
// calculados a partir de SMMLV_2026 para que se actualicen solos
// si solo cambia el salario mínimo.
export const SUBSIDIOS = [
  { id: "ninguno", label: "Ninguno", amount: 0, link: null },
  {
    id: "mcy_a1c8",
    label: "Mi Casa Ya · Sisbén A1–C8 (30 SMMLV)",
    amount: 30 * SMMLV_2026,
    note: "ingresos ≤ 2 SMMLV · cupos muy limitados en 2026",
    link: "https://www.minvivienda.gov.co/viceministerio-de-vivienda/mi-casa-ya/subsidio-familiar-de-vivienda-nueva-0",
  },
  {
    id: "mcy_c9d20",
    label: "Mi Casa Ya · Sisbén C9–D20 (20 SMMLV)",
    amount: 20 * SMMLV_2026,
    note: "ingresos 2–4 SMMLV · cupos muy limitados en 2026",
    link: "https://www.minvivienda.gov.co/viceministerio-de-vivienda/mi-casa-ya/subsidio-familiar-de-vivienda-nueva-0",
  },
  {
    id: "caja",
    label: "Caja de Compensación (ej. Colsubsidio, ~30 SMMLV)",
    amount: 42705000,
    note: "requiere afiliación vigente como trabajador",
    link: "https://www.portafolio.co/mis-finanzas/vivienda/subsidios-de-vivienda-vigentes-en-2026-cajas-de-compensacion-y-programas-locales-tras-mi-casa-ya-485814",
  },
  {
    id: "concurrencia",
    label: "Concurrencia (Caja + Gobierno, 50 SMMLV)",
    amount: 50 * SMMLV_2026,
    note: "ingresos ≤ 2 SMMLV · combina los dos subsidios anteriores",
    link: "https://www.minvivienda.gov.co/viceministerio-de-vivienda/mi-casa-ya/subsidio-familiar-de-vivienda-nueva-0",
  },
  { id: "custom", label: "Otro monto", amount: null, note: "", link: null },
];

export const PLAZOS = [10, 15, 20, 25, 30];

export const AÑOS_HITO = [5, 7, 10, 12, 15, 20, 30, 40];

// Valorización anual de vivienda en Colombia.
// Promedio histórico de largo plazo (DANE / Banco de la República / Camacol): 5%-6% anual.
// El IPVN del DANE viene registrando cifras más altas en el último año (8%-9%),
// por eso se deja como valor por defecto un punto medio conservador y editable.
export const VALORIZACION_DEFAULT = 6;
export const VALORIZACION_NOTA =
  "Promedio histórico de largo plazo en Colombia: 5%-6% anual. En 2025-2026 el DANE ha reportado variaciones más altas (8%-9%) por un mercado especialmente activo; ajusta este número según la ciudad y el momento.";
export const VALORIZACION_FUENTE = "https://vivienda.com.co/plusvalia-inmobiliaria-colombia-como-se-calcula/";

// Rentabilidad de arriendo (renta bruta anual como % del valor comercial).
// Referencia: cap rate típico en Colombia va de 4% (estratos altos, donde la
// ganancia es más por valorización) a 10% (estratos bajos / ciudades intermedias,
// donde el arriendo pesa más). Tope legal: 1% mensual (12% anual) del valor comercial.
export const CANON_MAXIMO_LEGAL_MENSUAL_PCT = 1; // % del valor comercial, tope de Ley 820

export const PERFILES_ARRIENDO = [
  { id: "alto_estrato", label: "Estrato alto / grandes capitales", yieldAnual: 4.5, note: "la ganancia pesa más por valorización que por renta" },
  { id: "promedio", label: "Promedio nacional", yieldAnual: 6, note: "punto medio típico de mercado" },
  { id: "bajo_estrato", label: "Estrato bajo / ciudades intermedias", yieldAnual: 8.5, note: "mayor renta relativa, ej. Barranquilla, Eje Cafetero" },
  { id: "custom", label: "Otro % (yo lo escribo)", yieldAnual: null, note: "" },
];
export const RENTABILIDAD_ARRIENDO_FUENTE = "https://vivienda.com.co/calculadora-rentabilidad-inmobiliaria/";
