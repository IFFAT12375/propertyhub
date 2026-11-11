import { createHash, randomBytes } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function createOpaqueToken() {
  return randomBytes(48).toString('base64url')
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

export function createAccessToken(userId, sessionId) {
  return jwt.sign({ sid: sessionId }, env.JWT_ACCESS_SECRET, {
    subject: userId.toString(),
    expiresIn: env.ACCESS_TOKEN_TTL,
    issuer: 'propertyhub-api',
    audience: 'propertyhub-client',
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'propertyhub-api',
    audience: 'propertyhub-client',
  })
}
