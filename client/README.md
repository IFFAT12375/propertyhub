# PropertyHub client

React and Vite frontend for the PropertyHub API.

## Setup

From this directory, run `npm install` and copy `.env.example` to `.env` if the file is missing. Set `VITE_API_BASE_URL` to the API root ending in `/api/v1`.

## Run and check

```sh
npm run dev
npm run lint
npm run build
```

The default Vite origin is `http://localhost:5173`; the server must allow that origin in `CORS_ORIGINS`. See [the testing plan](../docs/TESTING_PLAN.md) for the complete local workflow.

For Vercel, set the project root to `client`, use the Vite preset, build with `npm run build`, and publish `dist`. Set `VITE_API_BASE_URL` in the Vercel project to the deployed API base ending in `/api/v1`; this value is embedded at build time. See the [deployment guide](../docs/DEPLOYMENT.md) for API, domain, and cookie requirements.
