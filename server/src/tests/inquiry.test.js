import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import mongoose from 'mongoose'
import Inquiry from '../models/Inquiry.js'
import { listMyInquiries } from '../services/inquiry.service.js'
import {
  createInquiryBodySchema,
  listMyInquiriesQuerySchema,
  updateInquiryFollowUpBodySchema,
  verifyInquiryQuerySchema,
} from '../validators/inquiry.validators.js'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { sendInquiryVerification } from '../services/email.service.js'

describe('inquiry request validation', () => {
  it('accepts guest contact details and registered-user inquiry bodies', () => {
    const propertyId = '507f1f77bcf86cd799439011'
    assert.equal(createInquiryBodySchema.safeParse({
      propertyId,
      name: 'Sana Ahmed',
      email: 'SANA@example.com',
      message: 'Please share more information.',
    }).success, true)
    assert.equal(createInquiryBodySchema.safeParse({
      propertyId,
      message: 'Please share more information.',
    }).success, true)
  })

  it('accepts only well-formed verification tokens', () => {
    assert.equal(verifyInquiryQuerySchema.safeParse({ token: 'a'.repeat(64) }).success, true)
    assert.equal(verifyInquiryQuerySchema.safeParse({ token: 'short' }).success, false)
  })

  it('validates pagination for a user-owned inquiry list', () => {
    assert.deepEqual(listMyInquiriesQuerySchema.parse({ page: '2', limit: '10' }), {
      page: 2,
      limit: 10,
    })
    assert.equal(listMyInquiriesQuerySchema.safeParse({ propertyId: 'other-user-property' }).success, false)
  })

  it('queries only the authenticated user’s inquiries and paginates results', async (t) => {
    const userId = new mongoose.Types.ObjectId()
    let capturedFilter
    let capturedSkip
    let capturedLimit
    const results = [{ _id: new mongoose.Types.ObjectId() }]
    const query = {
      populate() { return this },
      sort() { return this },
      skip(value) { capturedSkip = value; return this },
      limit(value) { capturedLimit = value; return Promise.resolve(results) },
    }
    t.mock.method(Inquiry, 'find', (filter) => {
      capturedFilter = filter
      return query
    })
    t.mock.method(Inquiry, 'countDocuments', async (filter) => {
      assert.deepEqual(filter, { seeker: userId })
      return 21
    })

    const result = await listMyInquiries(userId, { page: 2, limit: 10 })
    assert.deepEqual(capturedFilter, { seeker: userId })
    assert.equal(capturedSkip, 10)
    assert.equal(capturedLimit, 10)
    assert.equal(result.inquiries, results)
    assert.deepEqual(result.pagination, {
      page: 2,
      limit: 10,
      totalItems: 21,
      totalPages: 3,
    })
  })

  it('allows sellers to mark verified inquiries contacted or closed, not reset them', () => {
    assert.equal(updateInquiryFollowUpBodySchema.safeParse({ followUpStatus: 'contacted' }).success, true)
    assert.equal(updateInquiryFollowUpBodySchema.safeParse({ followUpStatus: 'closed' }).success, true)
    assert.equal(updateInquiryFollowUpBodySchema.safeParse({ followUpStatus: 'new' }).success, false)
  })

  it('uses the approved expiry and clearly reports console-only development email', async () => {
    assert.equal(env.INQUIRY_VERIFICATION_TTL_MINUTES, 45)
    if (env.EMAIL_PROVIDER !== 'console') return

    const messages = []
    const originalInfo = logger.info
    logger.info = function (...args) {
      messages.push(args[0])
      return this
    }

    try {
      const emailSent = await sendInquiryVerification({
        email: 'guest@example.test',
        verificationUrl: 'http://localhost:5173/inquiries/verify?token=sample',
      })

      assert.equal(emailSent, false)
      assert.match(messages[0].message, /Development-only/)
      assert.equal(messages[0].verificationUrl.includes('token=sample'), true)
    } finally {
      logger.info = originalInfo
    }
  })
})
