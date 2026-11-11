import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  createSellerApplicationBodySchema,
  reviewSellerApplicationBodySchema,
} from '../validators/sellerApplication.validators.js'

describe('seller application validation', () => {
  it('requires an agency name for agent applications', () => {
    const result = createSellerApplicationBodySchema.safeParse({
      sellerType: 'agent',
      phone: '+92 300 0000000',
      message: 'I manage residential property listings.',
    })

    assert.equal(result.success, false)
    assert.ok(result.error.issues.some((issue) => issue.path[0] === 'agencyName'))
  })

  it('accepts owner applications without an agency name', () => {
    const result = createSellerApplicationBodySchema.safeParse({
      sellerType: 'owner',
      phone: '+92 300 0000000',
      message: 'I own the property I intend to list.',
    })
    assert.equal(result.success, true)
  })

  it('requires a rejection reason and rejects unsupported review fields', () => {
    assert.equal(reviewSellerApplicationBodySchema.safeParse({ status: 'rejected' }).success, false)
    assert.equal(reviewSellerApplicationBodySchema.safeParse({
      status: 'rejected',
      rejectionReason: 'Please provide additional details.',
    }).success, true)
    assert.equal(reviewSellerApplicationBodySchema.safeParse({
      status: 'approved',
      role: 'admin',
    }).success, false)
  })
})
