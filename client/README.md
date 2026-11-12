# PropertyHub client

React and Vite frontend for the PropertyHub API.

## Setup

```sh
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to the backend API root, including `/api/v1` (for local development, `http://localhost:5000/api/v1`). This value is bundled into the browser application; do not put secrets in `VITE_*` variables.

The backend must allow the frontend origin in `CORS_ORIGINS`. Browser API requests include credentials for the backend's HttpOnly refresh-token cookie.

## State and API architecture

- `src/app/store.js` configures the Redux store.
- `src/features/auth/` holds the in-memory access token, authenticated user, and session restoration state.
- `src/services/api/` defines RTK Query endpoints and normalization for the backend's `{ success, data }` response shape.
- Components use RTK Query hooks for server state, cache invalidation, loading, and errors. Temporary form and filter state stays local to components.

The client does not persist access or refresh tokens in browser storage. The backend sets the refresh token as an HttpOnly cookie; the client keeps the access token in Redux memory and refreshes the session when the app loads.

## Commands

```sh
npm run dev
npm run lint
npm run build
```
