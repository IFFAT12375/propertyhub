import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import AuthSession from '../models/AuthSession.js'
import Favorite from '../models/Favorite.js'
import Inquiry from '../models/Inquiry.js'
import Property from '../models/Property.js'
import SellerApplication from '../models/SellerApplication.js'
import User from '../models/User.js'

const objectId = () => '507f1f77bcf86cd799439011'

const validProperty = () => ({
  owner: objectId(),
  title: 'Family home near Gulberg',
  description: 'A family home with comfortable living space and a private yard.',
  category: 'residential',
  type: 'house',
  purpose: 'sale',
  price: 25000000,
  priceFrequency: null,
  area: 10,
  areaUnit: 'marla',
  location: { area: 'Gulberg', city: 'Lahore' },
  images: [{
    filename: 'property-image.webp',
    originalName: 'home.webp',
    mimeType: 'image/webp',
    size: 1024,
    order: 0,
  }],
})

describe('Mongoose domain models', () => {
  it('keeps passwords excluded from normal User queries and hashes them securely', async () => {
    assert.equal(User.schema.path('passwordHash').options.select, false)
    const hash = await User.hashPassword('correct-horse-battery')
    const user = new User({ passwordHash: hash })

    assert.notEqual(hash, 'correct-horse-battery')
    assert.equal(await user.verifyPassword('correct-horse-battery'), true)
    assert.equal(await user.verifyPassword('wrong-password'), false)
  })

  it('defaults public users to regular active accounts', () => {
    const user = new User({
      name: 'Sana Ahmed',
      email: 'sana@example.com',
      passwordHash: 'hash',
      phone: '+92 300 0000000',
    })

    assert.equal(user.role, 'user')
    assert.equal(user.accountStatus, 'active')
    assert.equal(user.passwordHash, 'hash')
  })

  it('retains a partial unique index for one pending application per applicant', () => {
    const pendingIndex = SellerApplication.schema.indexes().find(
      ([keys, options]) =>
        keys.applicant === 1 &&
        options.unique === true &&
        options.partialFilterExpression?.status === 'pending',
    )

    assert.ok(pendingIndex)
  })

  it('requires an agency name for agent seller applications', async () => {
    const application = new SellerApplication({
      applicant: objectId(),
      sellerType: 'agent',
      phone: '+92 300 0000000',
      message: 'I manage residential property listings.',
    })
    const error = await application.validate().then(
      () => null,
      (validationError) => validationError,
    )

    assert.equal(error?.errors.agencyName?.kind, 'user defined')
  })

  it('enforces property purpose, category, location, and independent status fields', async () => {
    const property = new Property(validProperty())
    await property.validate()

    assert.equal(property.moderationStatus, 'pending')
    assert.equal(property.availabilityStatus, 'available')
    assert.equal(property.recordStatus, 'active')

    property.category = 'commercial'
    const error = await property.validate().then(
      () => null,
      (validationError) => validationError,
    )
    assert.equal(error?.errors.type?.kind, 'user defined')
  })

  it('requires rental frequency and rejects sale listings with a frequency', async () => {
    const property = new Property({
      ...validProperty(),
      purpose: 'rent',
      priceFrequency: null,
    })
    const missingFrequency = await property.validate().then(
      () => null,
      (validationError) => validationError,
    )
    assert.equal(missingFrequency?.errors.priceFrequency?.kind, 'user defined')

    property.purpose = 'sale'
    property.priceFrequency = 'month'
    const saleWithFrequency = await property.validate().then(
      () => null,
      (validationError) => validationError,
    )
    assert.equal(saleWithFrequency?.errors.priceFrequency?.kind, 'user defined')
  })

  it('requires 1–10 valid property images', async () => {
    const property = new Property({ ...validProperty(), images: [] })
    const error = await property.validate().then(
      () => null,
      (validationError) => validationError,
    )

    assert.equal(error?.errors.images?.kind, 'user defined')
  })

  it('prevents duplicate favorites with a unique user/property index', () => {
    const index = Favorite.schema.indexes().find(
      ([keys, options]) =>
        keys.user === 1 && keys.property === 1 && options.unique === true,
    )
    assert.ok(index)
  })

  it('keeps inquiry verification and follow-up lifecycle fields separate', () => {
    assert.deepEqual(
      Inquiry.schema.path('verificationStatus').enumValues,
      ['pending', 'verified', 'expired'],
    )
    assert.deepEqual(
      Inquiry.schema.path('followUpStatus').enumValues,
      ['new', 'contacted', 'closed'],
    )
    assert.equal(Inquiry.schema.path('verificationTokenHash').options.select, false)
  })

  it('stores refresh-token hashes, not raw refresh tokens', () => {
    assert.equal(AuthSession.schema.path('refreshTokenHash').options.select, false)
    assert.equal(AuthSession.schema.path('refreshTokenHash').isRequired, true)
  })
})
