import { z } from 'zod'

const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase())
const phoneSchema = z.string().trim().min(7).max(32)
const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, {
    message: 'Password must be no more than 72 bytes.',
  })

export const registerBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
}).strict()

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
}).strict()
