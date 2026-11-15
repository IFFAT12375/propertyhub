import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { describe, it } from 'node:test'
import {
  listUsersQuerySchema,
  updateUserStatusBodySchema,
} from '../validators/admin.validators.js'

describe('admin user management', () => {
  it('accepts only supported user status updates and filters', () => {
    assert.equal(updateUserStatusBodySchema.safeParse({ accountStatus: 'suspended' }).success, true)
    assert.equal(updateUserStatusBodySchema.safeParse({ accountStatus: 'deleted' }).success, false)
    assert.equal(listUsersQuerySchema.safeParse({ role: 'seller', accountStatus: 'active' }).success, true)
    assert.equal(listUsersQuerySchema.safeParse({ role: 'root' }).success, false)
  })

  it('never runs the admin bootstrap command in test mode', () => {
    const result = spawnSync(process.execPath, ['src/scripts/createAdmin.js'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        ADMIN_NAME: 'Bootstrap Test',
        ADMIN_EMAIL: 'bootstrap@example.test',
        ADMIN_PHONE: '+92 300 0000000',
        ADMIN_PASSWORD: 'valid-pass-12345',
      },
    })

    assert.equal(result.status, 1)
    assert.match(result.stderr, /Admin bootstrap is not available in test mode/)
  })

  it('refuses to run the admin bootstrap command in production mode', () => {
    const result = spawnSync(process.execPath, ['src/scripts/createAdmin.js'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 3000,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        MONGO_URI: 'mongodb://127.0.0.1:1/propertyhub',
        JWT_ACCESS_SECRET: 'test-production-secret-that-is-long-enough',
        EMAIL_PROVIDER: 'smtp',
        SMTP_HOST: 'smtp.example.test',
        SMTP_USER: 'smtp-user',
        SMTP_PASSWORD: 'smtp-password',
        ADMIN_NAME: 'Bootstrap Test',
        ADMIN_EMAIL: 'bootstrap@example.test',
        ADMIN_PHONE: '+92 300 0000000',
        ADMIN_PASSWORD: 'valid-pass-12345',
      },
    })

    assert.equal(result.status, 1)
    assert.equal(result.error, undefined)
    assert.match(result.stderr, /Admin bootstrap is not available in production mode/)
    assert.doesNotMatch(result.stderr, /ECONNREFUSED/)
  })
})
