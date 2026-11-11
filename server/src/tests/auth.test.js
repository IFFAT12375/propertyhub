import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import request from 'supertest'
import app from '../app.js'
import { loginBodySchema, registerBodySchema } from '../validators/auth.validators.js'
import { updateProfileBodySchema } from '../validators/user.validators.js'
import { createAccessToken, createOpaqueToken, hashToken, verifyAccessToken } from '../utils/tokens.js'
import authorize from '../middlewares/authorize.js'

describe('authentication and request validation', () => {
  it('normalizes email addresses and rejects weak registration input', () => {
    const result = registerBodySchema.safeParse({
      name: 'Sana Ahmed',
      email: '  SANA@example.com ',
      phone: '+92 300 0000000',
      password: 'a-valid-pass-123',
    })

    assert.equal(result.success, true)
    assert.equal(result.data.email, 'sana@example.com')
    assert.equal(registerBodySchema.safeParse({
      name: 'S',
      email: 'invalid',
      phone: '1',
      password: 'short',
    }).success, false)
  })

  it('rejects unknown registration fields to prevent mass assignment', () => {
    const result = registerBodySchema.safeParse({
      name: 'Sana Ahmed',
      email: 'sana@example.com',
      phone: '+92 300 0000000',
      password: 'a-valid-pass-123',
      role: 'admin',
      accountStatus: 'active',
    })

    assert.equal(result.success, false)
  })

  it('requires a non-empty profile update and accepts only editable fields', () => {
    assert.equal(updateProfileBodySchema.safeParse({}).success, false)
    assert.equal(updateProfileBodySchema.safeParse({ role: 'admin' }).success, false)
    assert.equal(updateProfileBodySchema.safeParse({ name: 'Sana Ahmed' }).success, true)
  })

  it('issues signed access tokens and one-way refresh token hashes', () => {
    const refreshToken = createOpaqueToken()
    const sessionId = '507f1f77bcf86cd799439011'
    const userId = '507f191e810c19729de860ea'
    const accessToken = createAccessToken(userId, sessionId)
    const payload = verifyAccessToken(accessToken)

    assert.equal(payload.sub, userId)
    assert.equal(payload.sid, sessionId)
    assert.notEqual(hashToken(refreshToken), refreshToken)
    assert.notEqual(createOpaqueToken(), refreshToken)
  })

  it('returns structured field errors for invalid registration requests', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'S', email: 'bad', password: 'tiny' })

    assert.equal(response.status, 400)
    assert.equal(response.body.error.code, 'VALIDATION_ERROR')
    assert.ok(response.body.error.details.some((issue) => issue.field === 'body.phone'))
  })

  it('returns a generic authentication error for malformed login input', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bad', password: '' })

    assert.equal(response.status, 400)
    assert.equal(response.body.error.code, 'VALIDATION_ERROR')
  })

  it('requires an access token for protected user routes', async () => {
    const response = await request(app).get('/api/v1/users/me')

    assert.equal(response.status, 401)
    assert.equal(response.body.error.code, 'AUTHENTICATION_REQUIRED')
  })

  it('blocks suspended sellers from seller-only operations but preserves user access', () => {
    let sellerError
    authorize('seller')(
      { user: { role: 'seller', accountStatus: 'suspended' } },
      {},
      (error) => { sellerError = error },
    )
    assert.equal(sellerError?.code, 'SELLER_SUSPENDED')

    let userError
    authorize('user')(
      { user: { role: 'user', accountStatus: 'active' } },
      {},
      (error) => { userError = error },
    )
    assert.equal(userError, undefined)
  })
})
