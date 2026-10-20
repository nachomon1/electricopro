# EléctricoPro Chile

Directorio de instaladores eléctricos autorizados SEC con planes de suscripción (Flow.cl).

## Ver el sitio en localhost

```bash
npm install        # solo la primera vez
npm run dev        # desarrollo con recarga en caliente
```

Abre **http://localhost:3000** — la app completa (frontend + API + auth) corre en ese puerto.

### Otras formas de correrlo

| Comando | Qué hace | URL |
|---|---|---|
| `npm run dev` | Desarrollo con HMR (cambios se ven al instante) | http://localhost:3000 |
| `npm run build` | Compila producción a `dist/` | — |
| `npm start` | Sirve la versión compilada (después de `build`) | http://localhost:3000 |
| `npm run preview` | Solo el frontend compilado, sin API | http://localhost:3000 |

> Si el puerto 3000 está ocupado: `lsof -ti:3000 | xargs kill` y vuelve a intentar.
> Tanto `dev` como `preview` aceptan conexiones desde la red local (`host: true`),
> útil para probar en tu celular con la IP de tu computador.

## Base de datos

```bash
npm run db:push    # sincroniza el schema (desarrollo)
npx tsx db/seed.ts # datos de ejemplo (opcional)
```

## Pagos con Flow.cl

Configura en `.env`:

```
FLOW_API_KEY=tu_api_key
FLOW_SECRET_KEY=tu_secret_key
FLOW_URL=https://sandbox.flow.cl/api   # pruebas
# FLOW_URL=https://www.flow.cl/api     # producción
```

Webhook de confirmación: `POST /api/flow/confirm` — configúralo en tu panel de Flow
apuntando a `https://tudominio.cl/api/flow/confirm`.

## Google Analytics

Pega tu snippet GA4 en `index.html` (está marcado con un comentario).

## Estructura

```
src/pages/       Home, Directorio, Profesional, Planes, Publicar, Panel, PagoResultado
src/components/  Header, Footer, ProCard, PlanCards, ProfileForm, Reveal
api/             Hono + tRPC (directorio, profesionales, leads, pagos Flow)
api/lib/flow.ts  Integración Flow (firma HMAC, create, getStatus)
contracts/       Constantes compartidas (planes, precios, regiones, servicios)
db/schema.ts     users, professionals, leads, payments
```
