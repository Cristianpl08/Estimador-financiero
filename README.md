# Dos caminos

Simulador para comparar, en pesos colombianos, dos caminos financieros:
ahorrar/invertir un monto mensual, o comprar un apartamento con crédito
hipotecario y subsidios. Es una app 100% de front-end: no tiene backend ni
base de datos, todo se calcula en el navegador y se pierde al recargar.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre la URL que muestre la terminal (por defecto `http://localhost:5173`).

## Cómo generar la versión de producción

```bash
npm run build
```

Esto crea la carpeta `dist/` con archivos estáticos que puedes subir a
cualquier hosting estático (Netlify, Vercel, GitHub Pages, un bucket S3, etc.)
sin ninguna configuración adicional.

## Actualizar tasas, subsidios o topes

Todos los datos "reales" de Colombia (tasas de bancos, subsidios, SMMLV,
topes VIS/VIP) están en un único archivo: `src/data/constants.js`. Si le pides
a Claude que actualice esas cifras, revisará y editará solo ese archivo — ver
`CLAUDE.md` para el detalle de cómo debe hacerlo.
