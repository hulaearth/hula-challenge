# Hula experience day — Task 2 starter

A small starting point for implementing a bird dashboard. The React page is
intentionally empty: choose and implement your own workflow from the challenge.
The API, generated TypeScript client, TanStack Query provider, Tailwind CSS,
ESLint and Prettier are already configured.

## Requirements

- Node.js 24 recommended (minimum 22.18), with npm
- Python 3.12 or newer
- [uv](https://docs.astral.sh/uv/getting-started/installation/) for Python dependencies

No database, API keys, Docker or external data service is needed. Package
installation requires internet access. Dependency lockfiles are included.

## Run locally

Open two terminals in the repository root.

**Terminal 1 — backend**

```sh
cd backend
uv sync --locked
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Interactive API documentation: <http://127.0.0.1:8000/docs>.

**Terminal 2 — frontend**

```sh
cd frontend
npm ci
npm run dev
```

Open <http://127.0.0.1:5173>. An empty light-grey page is expected. Start editing
`frontend/src/App.tsx`. Tailwind utility classes are available immediately.
Vite proxies `/api` requests to `http://127.0.0.1:8000`, so no CORS setup is needed.
If you change the backend port, update `frontend/vite.config.ts` too.

## Repository layout

```text
frontend/
  src/App.tsx                 Empty page for your implementation
  src/main.tsx                React root and TanStack Query provider
  src/api.ts                  Configured API exports; import from here
  src/api/generated/          Generated SDK, types and query options
  openapi-ts.config.ts        Client generator configuration
backend/
  app/main.py                 FastAPI routes, search, sorting and pagination
  app/models.py               Response schemas (source of truth)
  app/mock_data.json          All 16 hardcoded species and observations
  openapi.json                Exported API contract
  export_openapi.py           Offline schema export
  tests/test_api.py           API behavior checks
```

## API

### `GET /api/detections`

Returns **one aggregated row per detected species**, matching the reference table;
these are not individual recording events. Each item has a stable bird ID, common
and scientific names, conservation status, presence category, sensor names,
site names, last detection timestamp, image URL and detection count.

| Parameter | Default | Accepted values |
| --- | --- | --- |
| `page` | `1` | Integer, at least 1 |
| `page_size` | `10` | Integer, 1–100 |
| `search` | empty | Common or scientific name, case insensitive, up to 100 characters |
| `sort_by` | `last_detected_at` | `last_detected_at`, `common_name`, `detection_count` |
| `order` | `desc` | `asc`, `desc` |

Response envelope: `{ items, total, page, page_size, total_pages }`.
`total` is the matching species count before pagination. An out-of-range page
returns an empty `items` array; no matches gives `total_pages: 0`. Invalid
parameters return HTTP 422. Reset the page to 1 when changing search or filters.

```sh
curl 'http://127.0.0.1:8000/api/detections?page=1&page_size=5'
curl 'http://127.0.0.1:8000/api/detections?search=tit&sort_by=common_name&order=asc'
```

### `GET /api/birds/{bird_id}`

Returns the summary fields plus description, habitat, breeding months (1–12),
population trend, audio URL and monthly activity. Unknown IDs return HTTP 404.

```sh
curl 'http://127.0.0.1:8000/api/birds/red-backed-shrike'
```

### Mock data conventions

All observations and status labels are fictional demonstration data, not an
IUCN or Bavarian Red List assessment. Presence labels are supplied mock values,
not conclusions inferred from recordings. Counts represent detection events,
**not individual birds**. Monthly counts sum to each bird's total; timestamps
are fixed in UTC, covering April–September 2026, with September partial.

`image_url` and `audio_url` are deliberately `null`: no photos or recordings are
bundled. Render a fallback, or add appropriately licensed assets and populate
these fields. Habitat and breeding-season text are illustrative. No realized
bird index or expected-species baseline is supplied. Add mock fields or routes
as needed for your chosen workflow.

## Use the generated client

Import through `src/api.ts`, which configures same-origin requests. The app
already wraps your components in `QueryClientProvider`.

```tsx
import { useQuery } from '@tanstack/react-query'
import { listDetectionsOptions, getBirdOptions } from './api'

// Inside a component:
const detections = useQuery(
  listDetectionsOptions({ query: { page: 1, page_size: 10 } }),
)
const bird = useQuery(
  getBirdOptions({ path: { bird_id: 'red-backed-shrike' } }),
)
// Handle isPending, isError and data in your chosen UI.
```

The SDK also exports `listDetections` and `getBird` for direct calls. Use
`throwOnError: true` if you want direct SDK failures to throw. Generated query
options already throw errors for TanStack Query to handle.

After changing the backend schemas or routes, run **from the repository root**:

```sh
uv run --directory backend python export_openapi.py
cd frontend
npm run generate:api
```

Commit both `backend/openapi.json` and `frontend/src/api/generated/` with API
changes. Do not edit generated files by hand. No running backend is required.
Generation follows the [Hey API TanStack Query documentation](https://heyapi.dev/docs/openapi/typescript/plugins/tanstack-query);
Tailwind uses its [Vite integration](https://tailwindcss.com/docs/installation/using-vite).

## Checks

From the repository root:

```sh
uv run --directory backend pytest
uv run --directory backend ruff check .
uv run --directory backend ruff format --check .
cd frontend
npm run lint
npm run format:check
npm run build
```

`npm run format` formats handwritten frontend files. Generated code is excluded
from ESLint and Prettier but included in TypeScript checking. `npm run typecheck`
runs TypeScript checks without bundling. To inspect the production build locally,
run `npm run preview` with the backend running, then open <http://127.0.0.1:4173>.

The backend tests cover complete pagination without duplicate species, empty
results, search, sorting, invalid parameters, missing birds and consistency
between list/detail/activity data. A temporary browser smoke check verified that the generated TanStack Query
options load two distinct pages and a matching bird detail through Vite.
No candidate dashboard workflow or permanent browser UI tests are supplied. The current backend test stack emits upstream deprecation
warnings; all tests pass. A `js-yaml` override selects a patched version of a
transitive code-generation dependency; revisit it when updating Hey API.

This is a local exercise scaffold. It has no authentication, persistence,
production deployment configuration or ecological validation. A deployed frontend
would need a reverse proxy for `/api` or an explicit API origin with corresponding
backend CORS configuration; Vite's proxy is only for local development/preview.
