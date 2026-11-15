# PropertyHub testing plan

This plan prepares a local PropertyHub environment for manual UI and API testing. It does not create test accounts or alter application data.

## Prerequisites

- Node.js 20.19 or newer and npm.
- MongoDB installed and running locally.
- The repository cloned with dependencies installable from the `client/` and `server/` package manifests.
- Ports 5000 and 5173 available, unless local configuration is changed.

Do not point local testing at a production MongoDB URI. Keep test accounts and listings in a dedicated local database.

## Environment setup

The local environment files are ignored by Git. Preserve existing `.env` files; do not overwrite them if they contain settings you need.

```sh
test -e server/.env || cp server/.env.example server/.env
test -e client/.env || cp client/.env.example client/.env
npm --prefix server install
npm --prefix client install
```

Review the environment files before starting. The server example uses a local MongoDB URI, allows the default Vite origin, and uses console-only email verification. The client example points to the local API. Local development does not require production credentials or SMTP credentials.

Configure these server variable names as needed:

`NODE_ENV`, `PORT`, `MONGO_URI`, `CORS_ORIGINS`, `LOG_LEVEL`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `JSON_BODY_LIMIT`, `JWT_ACCESS_SECRET`, `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL_DAYS`, `AUTH_RATE_LIMIT_MAX`, `INQUIRY_RATE_LIMIT_MAX`, `PUBLIC_API_URL`, `PUBLIC_WEB_URL`, `INQUIRY_VERIFICATION_TTL_MINUTES`, `EMAIL_PROVIDER`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `UPLOAD_DIR`.

The client variable is `VITE_API_BASE_URL`. The admin bootstrap additionally reads `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PHONE`, and `ADMIN_PASSWORD`.

For the default local setup, use the example's `http://localhost:5173` frontend origin. CORS matching is exact: `http://127.0.0.1:5173` and other ports are different origins. If Vite runs on another host or port, add that exact origin to local `CORS_ORIGINS`.

## Start the applications

Start MongoDB first. In separate terminals from the repository root, run:

```sh
npm --prefix server run dev
npm --prefix client run dev
```

Open the Vite URL printed in the client terminal. The default is `http://localhost:5173`. To stop either app, use Ctrl+C in its terminal.

Available checks:

```sh
npm --prefix server test
npm --prefix server audit --omit=dev
npm --prefix client run lint
npm --prefix client run build
```

## Database startup behavior

For local development, the server waits for MongoDB before opening its HTTP listener. Database selection has a five-second timeout; if MongoDB is unavailable, startup reports an error and exits nonzero. On Vercel, database-backed requests establish a cached connection on demand. The readiness endpoint attempts a connection and returns HTTP 503 when MongoDB is unavailable.

The existing automated server tests use mocked or temporary data; there is no seed script or checked-in manual test-account fixture.

## Test account setup

Use distinct local accounts for each role:

1. **Ordinary user:** register through the client. Public registration only creates the ordinary `user` role.
2. **Pending seller:** register another ordinary user, sign in, and submit an owner or agent application from `/seller/apply`. It should appear as pending in that account's application history.
3. **Admin:** create one administrator only in the isolated local database. Set `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PHONE`, and `ADMIN_PASSWORD` in a secure local process environment, confirm `MONGO_URI` points to the local test database, then run:

   ```sh
   npm --prefix server run create-admin
   ```

   Do not put credentials in command arguments, documentation, or committed files. The script refuses test and production modes and checks that the email is unused. There is no public admin-registration route.

4. **Approved seller:** register a separate ordinary account, submit an application, then sign in as the local admin and approve that application from `/admin/seller-applications`. The account becomes a seller only through that review workflow.

The admin bootstrap is optional for basic guest and ordinary-user checks, but required to exercise seller approval, property moderation, and admin workflows. It is blocked in test and production modes. No test accounts are supplied by the repository.

## API health verification

With the server running and MongoDB connected:

```sh
curl -i http://localhost:5000/api/health
curl -i http://localhost:5000/api/v1/health
curl -i http://localhost:5000/api/v1/health/ready
```

The first two report process health. The readiness endpoint returns HTTP 200 when MongoDB is connected and HTTP 503 otherwise.

## Manual testing checklist

- [ ] Load the home page and confirm public properties load from the API.
- [ ] Search and filter listings; open a property detail page.
- [ ] Register and log in as an ordinary user; reload and confirm the session is restored.
- [ ] Save and remove a favorite; check the favorites page.
- [ ] Submit a guest inquiry. With console email enabled, confirm the frontend says email was not sent, inspect the server log for the verification URL, and open it in the browser.
- [ ] Submit an inquiry while signed in; check `/inquiries` for the user's inquiry history.
- [ ] Submit a seller application; verify it is pending before admin review.
- [ ] As admin, review seller applications and approve one seller. Reject another with a reason.
- [ ] As the approved seller, create a property listing with images. Confirm the new listing is pending moderation.
- [ ] As admin, approve or reject a property listing; confirm only approved, available listings are public.
- [ ] As seller, edit a listing, update availability, archive a listing, and follow up on verified inquiries.
- [ ] As admin, review user accounts and suspend/reactivate a seller. Confirm suspended sellers cannot use seller operations.

### Image upload steps

Use an approved seller account and open `/seller/properties/new`. Submit a listing with 1–10 JPG, PNG, or WebP images, each no larger than 5 MB. The server verifies file content as well as the declared MIME type. Published files are stored under `server/uploads/` by default; temporary uploads use `server/uploads/.staging/`. Images are served at `/uploads/<filename>`.

To test invalid files, use a disposable local account and expect validation errors for unsupported types, files over the limit, or more than 10 images. Do not use valuable or private images.

## Known limitations

- No seed script, demo accounts, or production-ready SMTP test configuration is provided.
- `EMAIL_PROVIDER=console` does not send email; verification links must be copied from server logs. The default link points to the local frontend origin.
- Admin creation is a private development-only bootstrap command, not a public API. The application does not provide production administrator provisioning.
- The application has no general user-deletion endpoint. Property archive is a soft-delete; it does not reset or erase test data.
- Local image files and the default process-local rate limiter are not production-persistent/shared services. See the [deployment guide](./DEPLOYMENT.md) before deploying user uploads or relying on abuse limits.
- The MongoDB readiness route attempts a connection on Vercel; locally the normal server process will not listen if its initial database connection fails.

## Cleanup

Keep test activity in the dedicated local database. The application does not provide a complete cleanup/reset command. Archive test listings through the seller UI and remove extra listing images through the supported image controls where appropriate.

If records must be removed, use a database administration tool only against the verified local test database and remove only records identified by the test emails and record IDs you created. Check references between users, applications, inquiries, favorites, properties, and uploaded files before removing records. Do not run broad deletes, drop the database, reset databases, or perform cleanup against production.
