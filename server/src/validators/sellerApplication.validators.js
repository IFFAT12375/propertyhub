import { z } from 'zod'
import { idParamsSchema, paginationQuerySchema } from './common.validators.js'

const sellerApplicationBodySchema = z.object({
  sellerType: z.enum(['owner', 'agent']),
  agencyName: z.string().trim().max(160).optional(),
  phone: z.string().trim().min(7).max(32),
  message: z.string().trim().min(1).max(3000),
}).strict().superRefine((application, context) => {
  if (application.sellerType === 'agent' && !application.agencyName?.trim()) {
    context.addIssue({
      code: 'custom',
      path: ['agencyName'],
      message: 'Agency name is required for agent applications.',
    })
  }
})

const listQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
})

const approvalSchema = z.object({ status: z.literal('approved') }).strict()
const rejectionSchema = z.object({
  status: z.literal('rejected'),
  rejectionReason: z.string().trim().min(1).max(2000),
}).strict()

export const createSellerApplicationBodySchema = sellerApplicationBodySchema
export const listSellerApplicationsQuerySchema = listQuerySchema
export const sellerApplicationIdParamsSchema = idParamsSchema
export const reviewSellerApplicationBodySchema = z.discriminatedUnion('status', [
  approvalSchema,
  rejectionSchema,
])
