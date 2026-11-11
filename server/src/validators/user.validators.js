import { z } from 'zod'

const phoneSchema = z.string().trim().min(7).max(32)

export const updateProfileBodySchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
}).strict().refine(
  (profile) => Object.keys(profile).length > 0,
  'Provide at least one profile field to update.',
)
