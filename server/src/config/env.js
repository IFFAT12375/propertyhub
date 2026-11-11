import dotenv from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV !== 'test') {
  dotenv.config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGO_URI: z
    .string()
    .trim()
    .refine((value) => {
      try {
        const uri = new URL(value)
        return (
          ['mongodb:', 'mongodb+srv:'].includes(uri.protocol) &&
          Boolean(uri.hostname)
        )
      } catch {
        return false
      }
    }, 'Must be a valid mongodb:// or mongodb+srv:// URI')
    .default('mongodb://127.0.0.1:27017/propertyhub'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean))
    .pipe(z.array(z.string().url()).min(1)),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  JSON_BODY_LIMIT: z.string().trim().min(1).default('1mb'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'Must contain at least 32 characters')
    .default('development-only-secret-change-before-deploying'),
  ACCESS_TOKEN_TTL: z.string().regex(/^\d+[smhd]$/).default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),
  PUBLIC_API_URL: z.string().url().default('http://localhost:5000'),
  EMAIL_PROVIDER: z.enum(['console', 'smtp']).default('console'),
  EMAIL_FROM: z.string().min(1).default('PropertyHub <no-reply@propertyhub.local>'),
  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: z.stringbool().default(false),
  SMTP_USER: z.string().default(''),
  SMTP_PASSWORD: z.string().default(''),
  UPLOAD_DIR: z.string().trim().min(1).default('uploads'),
})

const parsedEnv = envSchema
  .superRefine((config, context) => {
    if (
      config.NODE_ENV === 'production' &&
      (config.JWT_ACCESS_SECRET.startsWith('development-only-') ||
        config.JWT_ACCESS_SECRET.startsWith('replace-with-'))
    ) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_ACCESS_SECRET'],
        message: 'A private production signing secret must be configured',
      })
    }
    if (config.EMAIL_PROVIDER === 'smtp' && (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASSWORD)) {
      context.addIssue({
        code: 'custom',
        path: ['EMAIL_PROVIDER'],
        message: 'SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are required when EMAIL_PROVIDER=smtp',
      })
    }
  })
  .safeParse(process.env)

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map(({ path, message }) => `${path.join('.')}: ${message}`)
    .join('; ')
  throw new Error(`Invalid server environment configuration: ${issues}`)
}

export const env = parsedEnv.data
