# CLAUDE.md

Guía para cualquier sesión de Claude (Code o chat) que trabaje después en este
repo. Léela antes de tocar código.

## Qué es esto

"Dos caminos": simulador en español que compara dos estrategias financieras en
Colombia:

1. **Ahorrar / invertir** un monto mensual a una tasa efectiva anual (E.A.),
   viendo el resultado a 5, 7, 10, 12, 15, 20, 30 y 40 años.
2. **Comprar un apartamento**: cuota inicial, tasa de crédito hipotecario,
   subsidios de vivienda, y opcionalmente financiar la propia cuota inicial.

Es una calculadora, no un producto con usuarios ni cuentas.

## Restricciones que NO se deben romper

- **Sin backend y sin base de datos.** Todo el cálculo ocurre en el navegador
  con JavaScript puro (fórmulas de interés compuesto / amortización francesa).
  No agregar un servidor, ni una API, ni Supabase/Firebase/etc., aunque se pida
  "guardar" algo — si el usuario pide persistencia, es un cambio de alcance
  explícito, no algo a asumir.
- **Sin `localStorage`/`sessionStorage`/cookies.** El estado vive solo en
  React (`useState`). Recargar la página debe reiniciar todo — así se pidió
  explícitamente. No "arreglar" esto agregando persistencia por iniciativa
  propia.
- **Sin cuentas de usuario ni analítica.**

## Stack

Vite + React 18 + Tailwind CSS 3 + Recharts (gráfica del camino de ahorro) +
lucide-react (iconos). Sin router (solo dos tabs con estado local).

```
npm install
npm run dev       # desarrollo local
npm run build     # genera dist/ estático, listo para cualquier hosting estático
npm run preview   # sirve el build de producción localmente
```

No hay variables de entorno ni claves de API que configurar.

## Estructura

```
src/
  data/constants.js      ← ÚNICO archivo con cifras "reales" de Colombia
  utils/finance.js        ← fórmulas financieras puras (sin UI)
  components/ui.jsx       ← primitivos de UI (Field, Select, NumberInput, StatCard, SourceLink)
  components/CaminoAhorro.jsx    ← tab 1
  components/CaminoVivienda.jsx  ← tab 2
  App.jsx                 ← layout, header, tabs, footer
```

## Lo que hay que mantener actualizado (`src/data/constants.js`)

Este archivo es la razón de ser de este documento. Sus datos caducan; cuando
el usuario pida "actualiza las tasas/subsidios", el flujo es:

1. **Buscar en la web** (no asumir ni usar memoria del modelo) los valores
   actuales:
   - `SMMLV_2026` → salario mínimo mensual legal vigente del año en curso.
     Buscar: `"salario mínimo Colombia [año]"`. Los topes VIS/VIP
     (`TOPES_VIVIENDA`) se recalculan solos porque dependen de esta constante.
   - `BANCOS` → tasas E.A. de crédito hipotecario por entidad. Buscar:
     `"tasas crédito hipotecario Colombia [mes] [año] Superfinanciera"`. Estas
     cambian mes a mes; no hay que perseguir precisión al día, pero sí evitar
     dejar cifras con más de ~3-4 meses de antigüedad si el usuario pide una
     actualización.
   - `SUBSIDIOS` → montos y **vigencia** de Mi Casa Ya, cajas de compensación
     y concurrencia. Buscar: `"subsidio Mi Casa Ya vigente [año]"` y
     `"subsidios vivienda cajas de compensación [año]"`. Importante: a
     mediados de 2026 Mi Casa Ya no tenía inscripciones nuevas abiertas
     (solo cupos remanentes) — verificar si esto sigue así o cambió, y
     reflejarlo en el campo `note` de cada opción, no solo en el monto.
   - `CUOTA_INICIAL_OPCIONES` → porcentajes mínimos típicos (10% leasing, 20%
     VIS, 30% tradicional). Cambian con menos frecuencia; solo revisar si el
     usuario reporta algo distinto o pide verificarlo.
   - `VALORIZACION_DEFAULT` → valorización anual promedio de vivienda.
     Buscar: `"valorización anual vivienda Colombia DANE [año]"` (índice IPVN).
     Es un promedio de referencia, no una predicción — el histórico de largo
     plazo es 5%-6% anual, pero el IPVN reciente puede mostrar más. No hay que
     perseguir el dato del último trimestre; el objetivo es un número
     razonable a largo plazo que el usuario pueda ajustar.
   - `PERFILES_ARRIENDO` → rentabilidad bruta de arriendo (% anual del valor
     comercial) por perfil. Buscar: `"rentabilidad arriendo Colombia cap rate
     [año]"`. Varía bastante por estrato/ciudad (más renta en estratos bajos,
     más valorización en estratos altos); mantener como perfiles amplios, no
     como dato exacto por ciudad.
   - `CANON_MAXIMO_LEGAL_MENSUAL_PCT` → tope legal del canon de arrendamiento
     de vivienda urbana en Colombia (Ley 820), actualmente 1% mensual del
     valor comercial. Rara vez cambia; no hace falta revisarlo salvo que el
     usuario lo pida explícitamente.
2. **Editar solo `src/data/constants.js`.** Los componentes (`CaminoVivienda.jsx`,
   etc.) leen de ahí; no deberían necesitar cambios solo por actualizar cifras.
3. Actualizar el comentario `Corte: ...` al inicio del archivo con la fecha de
   la actualización.
4. Actualizar también los links de `SourceLink` en `CaminoVivienda.jsx` (pie de
   la columna de resultados) si las fuentes cambiaron de URL.
5. Correr `npm run build` para confirmar que no se rompió nada antes de dar
   por terminada la actualización.

No hace falta pedir permiso para investigar y actualizar cifras cuando el
usuario lo solicite explícitamente; sí hay que decirle qué cambió y de dónde
salió el dato nuevo (con fuente/link), igual que se hizo la primera vez.

## Fórmulas (`src/utils/finance.js`)

- `eaToMonthly(ea)`: convierte una tasa efectiva anual a su equivalente
  mensual: `(1 + ea/100)^(1/12) - 1`. Todo el proyecto trabaja con tasas E.A.
  porque así se cotizan en Colombia; no cambiar a nominal/NAMV sin que el
  usuario lo pida.
- `fvSeries(inicial, mensual, ea, meses)`: valor futuro de un aporte inicial
  más una serie de aportes mensuales, con capitalización mensual.
- `cuotaFrancesa(principal, ea, meses)`: cuota fija de amortización francesa
  (la que usan los créditos hipotecarios en Colombia).
- `saldoPendiente(principal, ea, mesesPlazoTotal, mesesTranscurridos)`: saldo
  que aún se debe del crédito después de N cuotas pagadas. Se usa para
  calcular el patrimonio neto (valor del inmueble − deuda pendiente) en cada
  año hito, en `CaminoVivienda.jsx`.
- `valorFuturoInmueble(valorHoy, valorizacionEA, años)`: valor proyectado del
  inmueble con valorización anual compuesta. Independiente del crédito — no
  confundir con `fvSeries`, que es para la pestaña de ahorro/inversión.

## Sobre "patrimonio neto" y "arriendo estimado" (tab Comprar apartamento)

Estas dos secciones se agregaron para que la comparación con la pestaña de
"Ahorrar e invertir" sea justa:

- **Patrimonio neto** = valor proyectado del inmueble (con valorización) menos
  el saldo pendiente del crédito, calculado en los mismos años hito
  (`AÑOS_HITO`) que usa la pestaña de ahorro. Es lo comparable con el "Total
  acumulado" del camino de inversión.
- **Arriendo estimado** = ingreso mensual bruto si el propietario decide
  rentar el inmueble en vez de habitarlo, como % del valor comercial según el
  perfil elegido. No descuenta administración, predial ni mantenimiento —
  son gastos reales que quedaron fuera a propósito para no complicar el
  cálculo; si se agregan, debe quedar claro en la UI que el canon mostrado
  pasa a ser neto, no bruto.

Si se modifica cualquiera de estos dos bloques, mantener la fuente
(`SourceLink`) visible junto al dato, igual que con tasas y subsidios.

## Convenciones de diseño

- Paleta: **esmeralda** (`emerald-*`) para el camino de "ahorrar/invertir",
  **ámbar** (`amber-*`) para el camino de "comprar apartamento". Mantener esa
  asociación de color si se agregan más elementos a cada tab.
- Tipografía: `Fraunces` (serif, encabezados) + `IBM Plex Sans` (cuerpo),
  cargadas por `@import` en `src/index.css`. No cambiar a fuentes por defecto
  sin motivo — es una decisión de diseño intencional (ver skill de diseño de
  frontend si se agregan pantallas nuevas).
- Solo clases utilitarias estándar de Tailwind (paleta `stone`, `emerald`,
  `amber`) — no se usa configuración de colores custom.

## Despliegue

El sitio se publica en GitHub Pages (`https://cristianpl08.github.io/Estimador-financiero/`)
automáticamente vía GitHub Actions (`.github/workflows/deploy.yml`) en cada
push a `main`: instala dependencias, corre `npm run build` y publica `dist/`.
No hace falta desplegar a mano.

**Si el repo cambia de nombre**, el `base: "/<nombre-repo>/"` en
`vite.config.js` debe actualizarse en el mismo commit — si no coincide con la
subruta de Pages, la página carga en blanco (los assets se piden con rutas
absolutas que no existen).

## Si se pide agregar algo nuevo

- Un tercer "camino" (ej. comparar con arriendo): crear
  `src/components/CaminoX.jsx` siguiendo el mismo patrón (estado local +
  `useMemo` para los cálculos derivados), agregar su tab en `App.jsx`, y sus
  constantes/fórmulas en `data/` y `utils/` respectivamente — no mezclar
  cifras de referencia dentro de los componentes.
- Exportar a PDF/imagen, comparar ambos caminos lado a lado, guardar
  escenarios: son ampliaciones razonables de alcance; confirmar con el
  usuario antes de introducir dependencias nuevas grandes.
