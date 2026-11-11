import { z } from 'zod'
import { lahoreAreas, propertyTypesByCategory } from '../config/propertyOptions.js'
import { idParamsSchema, paginationQuerySchema } from './common.validators.js'

const optionalTitle = z.string().trim().max(180).optional()
const description = z.string().trim().min(1).max(10000)
const category = z.enum(['residential', 'commercial'])
const type = z.enum(Object.values(propertyTypesByCategory).flat())
const purpose = z.enum(['sale', 'rent'])
const price = z.coerce.number().finite().min(1)
const priceFrequency = z.preprocess(
  (value) => value === '' || value === undefined ? null : value,
  z.enum(['month', 'year']).nullable(),
)
const area = z.coerce.number().finite().min(1)
const areaUnit = z.enum(['marla', 'kanal', 'sq ft'])
const integerCount = z.coerce.number().int().min(0)
const optionalDetail = (max) => z.string().trim().max(max).optional()
const phoneVisible = z.preprocess((value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}, z.boolean().default(true))

const propertyFieldsSchema = z.object({
  title: optionalTitle,
  description,
  category,
  type,
  purpose,
  price,
  priceFrequency,
  area,
  areaUnit,
  bedrooms: integerCount,
  bathrooms: integerCount,
  locationArea: z.enum(lahoreAreas),
  block: optionalDetail(100),
  street: optionalDetail(160),
  address: optionalDetail(500),
  phoneVisible,
}).strict()

const propertyCreateSchema = propertyFieldsSchema.superRefine((property, context) => {
  if (!propertyTypesByCategory[property.category].includes(property.type)) {
    context.addIssue({
      code: 'custom',
      path: ['type'],
      message: 'Property type does not match the selected category.',
    })
  }
  if (property.purpose === 'rent' && !property.priceFrequency) {
    context.addIssue({
      code: 'custom',
      path: ['priceFrequency'],
      message: 'Rental listings require a billing period.',
    })
  }
  if (property.purpose === 'sale' && property.priceFrequency) {
    context.addIssue({
      code: 'custom',
      path: ['priceFrequency'],
      message: 'Sale listings cannot have a rental billing period.',
    })
  }
})

const propertyUpdateSchema = propertyFieldsSchema.partial().refine(
  (property) => Object.keys(property).length > 0,
  'Provide at least one property field to update.',
)

const publicListQuerySchema = paginationQuerySchema.extend({
  area: z.enum(lahoreAreas).optional(),
  category: z.enum(['residential', 'commercial']).optional(),
  type: z.enum(Object.values(propertyTypesByCategory).flat()).optional(),
  purpose: z.enum(['sale', 'rent']).optional(),
  minPrice: z.coerce.number().finite().min(0).optional(),
  maxPrice: z.coerce.number().finite().min(0).optional(),
}).strict().refine(
  (query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice,
  { path: ['maxPrice'], message: 'Maximum price must be greater than or equal to minimum price.' },
).refine(
  (query) =>
    !query.category ||
    !query.type ||
    propertyTypesByCategory[query.category].includes(query.type),
  { path: ['type'], message: 'Property type does not match the selected category.' },
)

const sellerListQuerySchema = paginationQuerySchema.extend({
  recordStatus: z.enum(['active', 'deleted']).optional(),
}).strict()

const reviewSchema = z.discriminatedUnion('moderationStatus', [
  z.object({ moderationStatus: z.literal('approved') }).strict(),
  z.object({
    moderationStatus: z.literal('rejected'),
    rejectionReason: z.string().trim().min(1).max(2000),
  }).strict(),
])

export const createPropertyBodySchema = propertyCreateSchema
export const updatePropertyBodySchema = propertyUpdateSchema
export const publicPropertyListQuerySchema = publicListQuerySchema
export const sellerPropertyListQuerySchema = sellerListQuerySchema
export const propertyIdParamsSchema = idParamsSchema
export const deleteImageParamsSchema = idParamsSchema.extend({
  filename: z.string().regex(/^[\da-f-]{36}\.(jpg|png|webp)$/i),
})
export const updateAvailabilityBodySchema = z.object({
  availabilityStatus: z.enum(['available', 'sold', 'rented', 'inactive']),
}).strict()
export const listPropertyModerationQuerySchema = paginationQuerySchema.extend({
  moderationStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
}).strict()
export const reviewPropertyBodySchema = reviewSchema
