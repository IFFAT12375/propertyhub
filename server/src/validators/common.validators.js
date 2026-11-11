import mongoose from 'mongoose'
import { z } from 'zod'

export const objectIdSchema = z.string().refine(
  (value) => mongoose.Types.ObjectId.isValid(value),
  'Must be a valid ID',
)

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const idParamsSchema = z.object({ id: objectIdSchema })
