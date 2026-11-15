# Production deployment

PropertyHub uses two Vercel projects connected to the same repository: one for the client and one for the API. Local `.env` files are ignored by Git and are not a substitute for Vercel Project Environment Variables.

## Client project

- Root Directory: `client`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: leave the Vercel default

Set `VITE_API_BASE_URL` to the API base URL ending in `/api/v1`, for example `https://api.example.com/api/v1`. Vite embeds this value at build time, so redeploy after changing it. Configure it for each Vercel environment used by the deployment.

## API project

- Root Directory: `server`
- Framework Preset: Express
- Build Command and Output Directory: leave unset/default
- Install Command: leave the Vercel default

Vercel runs the exported Express app in `src/app.js`. Database-backed routes establish and reuse a MongoDB connection; the local `src/server.js` listener is for local development.

The client project includes a Vercel rewrite for React Router deep links. This makes routes load directly but does not provide server-rendered SEO metadata.

Configure these variables in the API project's Vercel settings:

| Variable | Production value |
|---|---|
| `MONGO_URI` | A production MongoDB URI reachable from Vercel; never use localhost |
| `JWT_ACCESS_SECRET` | A unique, randomly generated secret stored only in Vercel |
| `CORS_ORIGINS` | Comma-separated exact client origins, without paths or trailing slashes |
| `PUBLIC_API_URL` | API origin, e.g. `https://api.example.com` |
| `PUBLIC_WEB_URL` | Client origin, e.g. `https://www.example.com` |
| `EMAIL_PROVIDER` | `smtp` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` | Values from the selected SMTP provider |

When `SMTP_SECURE=false`, the server requires STARTTLS. Use `SMTP_SECURE=true` for an SMTP server using implicit TLS. Production requires SMTP and a non-development JWT secret. Vercel sets `NODE_ENV` for deployment environments.

In Vercel's Environment Variables UI, enter each variable name and value separately. Do not include `.env` comment markers (`#`) or commit real credentials. Set the correct Production or Preview scope, then redeploy after changes.

## Domains, cookies, and CORS

`CORS_ORIGINS` must contain the browser's exact client origin. Add each production or preview origin explicitly; Vercel preview URLs can change. Do not use a broad wildcard with credentialed requests.

The refresh cookie uses `SameSite=Strict`. Use client and API custom domains under the same registrable domain (for example, `www.example.com` and `api.example.com`) so they are same-site. Separate default `*.vercel.app` project domains are cross-site and may prevent refresh cookies from being sent. Do not weaken the cookie policy without adding and reviewing CSRF protections.

Check `GET /api/v1/health` for process health and `GET /api/v1/health/ready` for MongoDB readiness. Readiness returns 503 when the database cannot be reached.

The public `/uploads` route allows cross-origin image embedding for the separate client project; other API routes retain the default same-origin resource policy. This does not make Vercel's local filesystem persistent.

## Production blockers to resolve

- Property images are currently written to local disk under `server/uploads`. Vercel function storage is not durable across deployments/instances, and local uploads are not a persistent image service. The app also permits up to 10 images of 5 MB each, which can exceed function request-body limits. Configure durable object storage and direct-to-storage uploads, then migrate existing images before accepting production listings.
- The default Express rate-limit store is process-local. It does not provide a shared limit across serverless instances; configure a shared store before relying on rate limits for production abuse prevention.
- Verify Atlas network access, SMTP delivery, cross-domain login refresh, image upload/retrieval, and account recovery with the actual production domains and services.

Do not run the admin bootstrap command against production. The repository does not provide a production administrator provisioning workflow.
