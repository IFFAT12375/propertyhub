# PropertyHub

PropertyHub is a Lahore property marketplace built with React, Express, and MongoDB.

## Live deployment

- Frontend: [PropertyHub live site](https://propertyhub-blush.vercel.app/)
- Backend API: [health check](https://propertyhub-api-zeta.vercel.app/api/v1/health) (`https://propertyhub-api-zeta.vercel.app/api/v1`)

## Run locally

1. Install and start MongoDB.
2. If missing, copy each `.env.example` to `.env` and review the local settings.
3. Install dependencies with `npm --prefix server install` and `npm --prefix client install`.
4. Start each app in a separate terminal:

   ```sh
   npm --prefix server run dev
   npm --prefix client run dev
   ```

See [docs/TESTING_PLAN.md](./docs/TESTING_PLAN.md) for the verified setup, test-account procedure, and manual checklist.

## Project documents

- [Product requirements](./docs/PRD.md)
- [Use cases](./docs/USE_CASES.md)
- [Testing plan](./docs/TESTING_PLAN.md)
- [Production deployment](./docs/DEPLOYMENT.md)
- [Server setup and API](./server/README.md)
- [Client setup](./client/README.md)
