import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, it } from 'node:test'
import {
  createPropertyBodySchema,
  publicPropertyListQuerySchema,
  reviewPropertyBodySchema,
  updateAvailabilityBodySchema,
} from '../validators/property.validators.js'
import { verifyImageFile } from '../utils/imageStorage.js'

const validPropertyBody = () => ({
  description: 'A family home with comfortable living space.',
  category: 'residential',
  type: 'house',
  purpose: 'sale',
  price: '25000000',
  priceFrequency: '',
  area: '10',
  areaUnit: 'marla',
  bedrooms: '3',
  bathrooms: '2',
  locationArea: 'Gulberg',
})

describe('property request validation', () => {
  it('accepts required property details and leaves title optional', () => {
    const result = createPropertyBodySchema.safeParse(validPropertyBody())

    assert.equal(result.success, true)
    assert.equal(result.data.title, undefined)
    assert.equal(result.data.price, 25000000)
    assert.equal(result.data.bedrooms, 3)
    assert.equal(result.data.phoneVisible, true)
  })

  it('requires description, area and unit, bedrooms, bathrooms, and location', () => {
    const body = validPropertyBody()
    delete body.description
    delete body.area
    delete body.areaUnit
    delete body.bedrooms
    delete body.bathrooms
    delete body.locationArea
    const result = createPropertyBodySchema.safeParse(body)

    assert.equal(result.success, false)
    const invalidFields = result.error.issues.map((issue) => issue.path[0])
    for (const field of ['description', 'area', 'areaUnit', 'bedrooms', 'bathrooms', 'locationArea']) {
      assert.ok(invalidFields.includes(field), `${field} should be required`)
    }
  })

  it('enforces category/type and sale/rental billing compatibility', () => {
    const mismatch = createPropertyBodySchema.safeParse({
      ...validPropertyBody(),
      category: 'commercial',
      type: 'house',
    })
    assert.equal(mismatch.success, false)

    const rental = createPropertyBodySchema.safeParse({
      ...validPropertyBody(),
      purpose: 'rent',
    })
    assert.equal(rental.success, false)

    const validRental = createPropertyBodySchema.safeParse({
      ...validPropertyBody(),
      purpose: 'rent',
      priceFrequency: 'month',
    })
    assert.equal(validRental.success, true)
  })

  it('rejects invalid public filters and requires availability to match purpose', () => {
    assert.equal(publicPropertyListQuerySchema.safeParse({ minPrice: 100, maxPrice: 10 }).success, false)
    assert.equal(publicPropertyListQuerySchema.safeParse({ category: 'commercial', type: 'house' }).success, false)
    assert.equal(updateAvailabilityBodySchema.safeParse({ availabilityStatus: 'rented' }).success, true)
  })

  it('requires an admin rejection reason for property moderation', () => {
    assert.equal(reviewPropertyBodySchema.safeParse({ moderationStatus: 'rejected' }).success, false)
    assert.equal(reviewPropertyBodySchema.safeParse({
      moderationStatus: 'rejected',
      rejectionReason: 'Please clarify the property description.',
    }).success, true)
  })

  it('checks uploaded file signatures instead of trusting their MIME header', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'propertyhub-images-'))
    const validPath = path.join(directory, 'valid.png')
    const invalidPath = path.join(directory, 'invalid.png')
    const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

    try {
      await writeFile(validPath, pngHeader)
      await writeFile(invalidPath, Buffer.from('<script>alert(1)</script>'))

      assert.equal(await verifyImageFile({ path: validPath, mimetype: 'image/png' }), true)
      assert.equal(await verifyImageFile({ path: invalidPath, mimetype: 'image/png' }), false)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
