# PropertyHub API

Express and Mongoose API for PropertyHub. Local development uses MongoDB at the URI configured by `MONGO_URI`.

## Setup and run

From this directory, run `npm install` and copy `.env.example` to `.env` if the file is missing. Review the local MongoDB URI, trusted CORS origins, and development email settings.

```sh
npm run dev
npm test
npm audit --omit=dev
```

For local development, the API connects to MongoDB before listening. If the database is unavailable, startup logs an error and exits without opening the API port. On Vercel, database-backed routes connect on request and reuse a cached connection.

## Configuration and checks

Environment variable names and local defaults are listed in `.env.example`. `CORS_ORIGINS` must include the exact frontend origin. `EMAIL_PROVIDER=console` writes guest inquiry verification links to the server log; it does not send email.

- `GET /api/health` and `GET /api/v1/health`: process health.
- `GET /api/v1/health/ready`: database readiness.
- Uploaded property images are served from `/uploads`.

Public registration creates ordinary users only. The `npm run create-admin` bootstrap script is restricted to development mode and should be used only with an isolated local database. No production administrator provisioning workflow is provided.

See [the testing plan](../docs/TESTING_PLAN.md) for account setup, API checks, and upload steps.
See the [deployment guide](../docs/DEPLOYMENT.md) for Vercel configuration and production storage requirements.
