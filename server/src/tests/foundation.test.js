import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { after, describe, it } from 'node:test'
import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app.js'

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
})

describe('backend foundation', () => {
  it('rejects invalid environment configuration with a useful field error', () => {
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', "import('./src/config/env.js')"],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: { ...process.env, PORT: 'not-a-port' },
      },
    )

    assert.equal(result.status, 1)
    assert.match(result.stderr, /Invalid server environment configuration: PORT/)
  })

  it('rejects MongoDB URIs with unsupported schemes', () => {
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', "import('./src/config/env.js')"],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
          ...process.env,
          MONGO_URI: 'https://not-a-mongodb-uri.example',
        },
      },
    )

    assert.equal(result.status, 1)
    assert.match(result.stderr, /Invalid server environment configuration: MONGO_URI/)
  })

  it('rejects the development JWT signing secret in production', () => {
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', "import('./src/config/env.js')"],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
          ...process.env,
          NODE_ENV: 'production',
          JWT_ACCESS_SECRET: 'development-only-secret-change-before-deploying',
        },
      },
    )

    assert.equal(result.status, 1)
    assert.match(result.stderr, /JWT_ACCESS_SECRET: A private production signing secret must be configured/)
  })

  it('requires SMTP credentials when SMTP email delivery is selected', () => {
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', "import('./src/config/env.js')"],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
          ...process.env,
          EMAIL_PROVIDER: 'smtp',
          SMTP_HOST: '',
          SMTP_USER: '',
          SMTP_PASSWORD: '',
        },
      },
    )

    assert.equal(result.status, 1)
    assert.match(result.stderr, /SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are required/)
  })

  it('serves a versioned liveness check with a request ID', async () => {
    const response = await request(app).get('/api/v1/health')

    assert.equal(response.status, 200)
    assert.equal(response.body.success, true)
    assert.match(response.headers['x-request-id'], /^[\da-f-]{36}$/i)
    assert.equal(response.body.requestId, response.headers['x-request-id'])
  })

  it('preserves the existing health endpoint', async () => {
    const response = await request(app).get('/api/health')

    assert.equal(response.status, 200)
    assert.equal(response.body.message, 'PropertyHub API is running')
  })

  it('reports database readiness without exposing connection details', async () => {
    const response = await request(app).get('/api/v1/health/ready')

    assert.equal(response.status, 503)
    assert.equal(response.body.success, false)
    assert.deepEqual(response.body.data, {
      status: 'not_ready',
      database: 'unavailable',
    })
  })

  it('returns a consistent 404 error response', async () => {
    const response = await request(app).get('/api/v1/missing?token=private')

    assert.equal(response.status, 404)
    assert.equal(response.body.success, false)
    assert.equal(response.body.error.code, 'ROUTE_NOT_FOUND')
    assert.equal(response.body.error.requestId, response.headers['x-request-id'])
    assert.equal(response.body.error.message.includes('private'), false)
  })

  it('maps malformed JSON to a safe client error', async () => {
    const response = await request(app)
      .post('/api/v1/missing')
      .set('Content-Type', 'application/json')
      .send('{"incomplete":')

    assert.equal(response.status, 400)
    assert.equal(response.body.error.code, 'INVALID_JSON')
    assert.equal(response.body.error.message.includes('incomplete'), false)
  })

  it('rejects request bodies larger than the configured limit', async () => {
    const response = await request(app)
      .post('/api/v1/missing')
      .set('Content-Type', 'application/json')
      .send(Buffer.alloc(1024 * 1024 + 1, 'a'))

    assert.equal(response.status, 413)
    assert.equal(response.body.error.code, 'REQUEST_TOO_LARGE')
  })

  it('sets security headers and allows configured origins', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173')

    assert.equal(response.status, 200)
    assert.equal(response.headers['x-content-type-options'], 'nosniff')
    assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:5173')
  })

  it('rejects origins outside the configured allowlist', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'https://not-allowed.example')

    assert.equal(response.status, 403)
    assert.equal(response.body.error.code, 'CORS_ORIGIN_DENIED')
  })

  it('limits versioned API requests with a consistent error response', () => {
    const result = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        "const { default: app } = await import('./src/app.js'); const { default: request } = await import('supertest'); const statuses = []; for (let index = 0; index < 3; index += 1) statuses.push((await request(app).get('/api/v1/missing')).status); if (statuses.join(',') !== '404,404,429') process.exitCode = 1; console.log(JSON.stringify(statuses))",
      ],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
          ...process.env,
          NODE_ENV: 'test',
          RATE_LIMIT_MAX: '2',
        },
      },
    )

    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /\[404,404,429\]/)
    assert.match(result.stdout, /RATE_LIMIT_EXCEEDED/)
  })
})
