import { z } from 'zod'
import { idParamsSchema, paginationQuerySchema } from './common.validators.js'

const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase())

export const createInquiryBodySchema = z.object({
  propertyId: idParamsSchema.shape.id,
  name: z.string().trim().min(2).max(100).optional(),
  email: emailSchema.optional(),
  phone: z.string().trim().max(32).optional(),
  message: z.string().trim().min(1).max(5000),
}).strict()

export const verifyInquiryQuerySchema = z.object({
  token: z.string().regex(/^[A-Za-z\d_-]{64}$/),
}).strict()

export const listInquiriesQuerySchema = paginationQuerySchema.extend({
  propertyId: idParamsSchema.shape.id.optional(),
  followUpStatus: z.enum(['new', 'contacted', 'closed']).optional(),
}).strict()

export const inquiryIdParamsSchema = idParamsSchema
export const updateInquiryFollowUpBodySchema = z.object({
  followUpStatus: z.enum(['contacted', 'closed']),
}).strict()
