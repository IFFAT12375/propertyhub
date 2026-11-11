import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { favoriteBodySchema } from '../validators/favorite.validators.js'

describe('favorite request validation', () => {
  it('requires a valid property ID and rejects mass-assigned fields', () => {
    assert.equal(favoriteBodySchema.safeParse({ propertyId: 'not-an-id' }).success, false)
    assert.equal(favoriteBodySchema.safeParse({
      propertyId: '507f1f77bcf86cd799439011',
      user: '507f191e810c19729de860ea',
    }).success, false)
    assert.equal(favoriteBodySchema.safeParse({
      propertyId: '507f1f77bcf86cd799439011',
    }).success, true)
  })
})
