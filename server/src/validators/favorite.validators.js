import { z } from 'zod'
import { idParamsSchema, paginationQuerySchema } from './common.validators.js'

export const favoriteBodySchema = z.object({
  propertyId: idParamsSchema.shape.id,
}).strict()

export const favoriteIdParamsSchema = z.object({
  propertyId: idParamsSchema.shape.id,
})

export const favoriteListQuerySchema = paginationQuerySchema
