import { z } from 'zod'
import { idParamsSchema, paginationQuerySchema } from './common.validators.js'

export const listUsersQuerySchema = paginationQuerySchema.extend({
  role: z.enum(['user', 'seller', 'admin']).optional(),
  accountStatus: z.enum(['active', 'suspended']).optional(),
}).strict()

export const adminUserIdParamsSchema = idParamsSchema
export const updateUserStatusBodySchema = z.object({
  accountStatus: z.enum(['active', 'suspended']),
}).strict()
