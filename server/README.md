# PropertyHub API

The backend is an Express API backed by MongoDB and Mongoose. It is implemented independently of the frontend.

## Requirements and setup

- Node.js 20.19 or newer
- npm
- A running local MongoDB instance (or another MongoDB deployment)

From this directory:

```sh
npm install
cp .env.example .env
```

Review `.env` before starting the server. In particular:

- Set `MONGO_URI` to the local MongoDB database URL. The example uses `mongodb://127.0.0.1:27017/propertyhub`.
- Replace `JWT_ACCESS_SECRET` with a private random value of at least 32 characters. Production rejects the example placeholder.
- Set `CORS_ORIGINS` to a comma-separated list of trusted frontend origins.
- `PUBLIC_API_URL` must be the externally reachable API origin used for property image URLs.
- `PUBLIC_WEB_URL` must be the frontend origin used by guest inquiry verification links.

Run the API:

```sh
npm run dev
```

`npm start` starts the production process. The server connects to MongoDB before it begins listening and handles `SIGINT`/`SIGTERM` for graceful shutdown.

Health endpoints:

- `GET /api/health` and `GET /api/v1/health` report that the process is responding.
- `GET /api/v1/health/ready` returns `200` when MongoDB is connected and `503` otherwise.

## Environment variables

See [`.env.example`](./.env.example) for the complete template.

| Variable | Purpose |
| --- | --- |
| `NODE_ENV`, `PORT` | Runtime environment and HTTP port. |
| `MONGO_URI` | MongoDB connection string. |
| `CORS_ORIGINS` | Allowed browser origins; credentials are enabled for refresh cookies. |
| `JWT_ACCESS_SECRET`, `ACCESS_TOKEN_TTL` | Signing secret and access-token lifetime (15 minutes by default). |
| `REFRESH_TOKEN_TTL_DAYS` | Refresh-session lifetime (30 days by default). |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_MAX`, `INQUIRY_RATE_LIMIT_MAX` | Global, authentication, and inquiry rate limits. |
| `JSON_BODY_LIMIT` | Maximum JSON request size. |
| `PUBLIC_API_URL` | Public API origin used when building property image URLs. |
| `PUBLIC_WEB_URL`, `INQUIRY_VERIFICATION_TTL_MINUTES` | Frontend verification-link origin and expiry (45 minutes by default). |
| `EMAIL_PROVIDER` | `console` logs verification links for development; `smtp` sends email. |
| `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` | SMTP sender and connection configuration. |
| `UPLOAD_DIR` | Local directory for property images. |
| `LOG_LEVEL` | Winston logging level. |

Production requires a private JWT secret and `EMAIL_PROVIDER=smtp` with SMTP credentials. Real SMTP delivery depends on the configured provider and has not been tested with deployment credentials.

## Administrator bootstrap

Public registration always creates a regular user; it cannot assign privileged roles. To create the initial administrator, provide `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PHONE`, and `ADMIN_PASSWORD` to the process environment using a secure local mechanism or secret manager, then run:

```sh
npm run create-admin
```

The command validates the same name, email, phone, and password rules as registration, hashes the password, creates an `admin` account, and refuses to overwrite an existing account. Do not put credentials in committed files or command-line arguments. The command intentionally refuses to run in test mode.

## Authentication and authorization

- `POST /api/v1/auth/login` returns a short-lived access JWT. Send it as `Authorization: Bearer ACCESS_TOKEN` to protected endpoints.
- Login and refresh set a rotating opaque refresh token in an `HttpOnly`, `SameSite=Strict` cookie scoped to `/api/v1/auth`. Browser clients must send credentials for refresh/logout and use an allowed CORS origin.
- `POST /api/v1/auth/refresh` rotates the refresh token and returns a new access JWT. Reuse of a rotated token is rejected.
- `POST /api/v1/auth/logout` revokes the refresh session and clears the cookie. Authenticated requests reload user and session state, so logout revocation and account suspension take effect immediately.
- Roles are `user`, `seller`, and `admin`. Seller access is granted through the reviewed seller-application workflow, not public registration.
- Suspended sellers cannot perform seller operations; their listings are hidden. Their ordinary profile, favorites, and inquiry capabilities remain available.

## API inventory

All endpoints below are prefixed with `/api/v1`. Unless marked public, endpoints require a bearer access token. Pagination uses `page` and `limit`; list responses include pagination metadata.

| Area | Method and path | Access | Purpose |
| --- | --- | --- | --- |
| Auth | `POST /auth/register` | Public | Create a regular user account. |
| Auth | `POST /auth/login` | Public | Authenticate and issue access token and refresh cookie. |
| Auth | `POST /auth/refresh` | Refresh cookie | Rotate refresh session and issue a new access token. |
| Auth | `POST /auth/logout` | Refresh cookie | Revoke refresh session and clear cookie. |
| Users | `GET /users/me` | User, seller, admin | Read the current profile. |
| Users | `PATCH /users/me` | User, seller, admin | Update the current profile. |
| Seller applications | `POST /seller-applications` | User | Submit an owner/agent application. Agent applications require an agency name. |
| Seller applications | `GET /seller-applications/mine` | User, seller | List the caller's application history. |
| Properties | `GET /properties` | Public | Search approved, available, active listings. Supports area, category, type, purpose, min/max price, and pagination filters. |
| Properties | `GET /properties/:id` | Public | Read a currently public listing. |
| Properties | `GET /properties/mine` | Seller | List the seller's listings, optionally filtered by record status. |
| Properties | `GET /properties/mine/:id` | Seller | Read one of the seller's listings. |
| Properties | `POST /properties` | Seller | Create a listing with `multipart/form-data`. |
| Properties | `PATCH /properties/:id` | Seller | Update a listing; edits require moderation again. |
| Properties | `PATCH /properties/:id/availability` | Seller | Change availability. |
| Properties | `DELETE /properties/:id/images/:filename` | Seller | Remove one of the seller's listing images. |
| Properties | `DELETE /properties/:id` | Seller | Soft-archive a listing. |
| Favorites | `POST /favorites` | User, seller, admin | Save a currently public property. Duplicate saves are idempotent. |
| Favorites | `GET /favorites` | User, seller, admin | List the caller's private favorites. |
| Favorites | `DELETE /favorites/:propertyId` | User, seller, admin | Remove a favorite. |
| Inquiries | `POST /inquiries` | Public or authenticated | Contact the owner of a currently public property. |
| Inquiries | `GET /inquiries/verify?token=...` | Public | Verify a guest inquiry's email; links are single-use. |
| Inquiries | `GET /inquiries/mine` | User, seller, admin | List only inquiries submitted by the current authenticated user. |
| Inquiries | `GET /inquiries` | Seller | List verified inquiries for the seller's properties. Supports `propertyId`, `followUpStatus`, and pagination filters. |
| Inquiries | `PATCH /inquiries/:id/follow-up` | Seller | Mark an owned, verified inquiry as `contacted` or `closed`. |
| Admin | `GET /admin/seller-applications` | Admin | Review the seller-application queue. |
| Admin | `PATCH /admin/seller-applications/:id/review` | Admin | Approve or reject an application; rejection requires a reason. |
| Admin | `GET /admin/properties` | Admin | List listings for moderation. |
| Admin | `PATCH /admin/properties/:id/review` | Admin | Approve or reject a listing; rejection requires a reason. |
| Admin | `GET /admin/users` | Admin | List users with optional role/status filters. Password data is never returned. |
| Admin | `PATCH /admin/users/:id/status` | Admin | Suspend or reactivate a seller account. |

Property fields include category (`residential` or `commercial`), compatible type (`house`, `apartment`, `plot`, `office`, `shop`, or `warehouse`), purpose (`sale` or `rent`), Lahore area, price, area and unit, bedrooms, bathrooms, and description. Title and detailed street/address fields are optional. Rentals require a `month` or `year` price frequency; sale listings do not accept one. Bedrooms and bathrooms are required for every type.

Property images use the multipart field name `images`. Uploads are stored on local disk; listings require 1 to 10 JPG/JPEG, PNG, or WebP images at up to 5 MB each. The server also checks file signatures instead of trusting the declared MIME type. Published images are served under `/uploads`; the upload directory should be persisted and backed up in deployment.

## Request examples

Register and log in:

```sh
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Sam Seller","email":"sam@example.com","phone":"+923001234567","password":"a-long-password"}'

curl -i -c cookies.txt -X POST http://localhost:5000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"sam@example.com","password":"a-long-password"}'
```

Use the returned access token for a protected request:

```sh
export ACCESS_TOKEN='replace-with-the-access-token-from-login'

curl http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Create a guest inquiry:

```sh
curl -X POST http://localhost:5000/api/v1/inquiries \
  -H 'Content-Type: application/json' \
  -d '{"propertyId":"<property-id>","name":"Taylor","email":"taylor@example.com","message":"Is this property available?"}'
```

In development with `EMAIL_PROVIDER=console`, the response explains that email was not sent and the frontend verification link is written to the server log. In production, SMTP delivery is required. Guest inquiries are not visible to sellers until verified; authenticated-user inquiries are verified on creation.

## Responses, errors, and validation

Successful responses use `success: true` and a `data` object (some also include a `message`). Errors are centralized and shaped as:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request details are invalid.",
    "details": [],
    "requestId": "..."
  }
}
```

Request bodies, query strings, and route parameters are validated with Zod; schemas that define strict objects reject unknown fields. Validation errors include field-level details. Authentication, authorization, duplicate-record, rate-limit, upload, and missing-resource failures use explicit HTTP statuses and error codes. Logs use the request ID, while server errors avoid exposing internal details in the response. `X-Request-Id` is returned to clients.

## Development checks

```sh
npm test
npm audit --omit=dev
```

The tests cover validation, authorization-related business rules, lifecycle behavior, and the backend foundation. MongoDB-backed integration smoke tests require a running local MongoDB service.
