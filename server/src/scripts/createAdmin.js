import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { logger } from '../config/logger.js'
import User from '../models/User.js'
import { registerBodySchema } from '../validators/auth.validators.js'

const details = registerBodySchema.safeParse({
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_EMAIL,
  phone: process.env.ADMIN_PHONE,
  password: process.env.ADMIN_PASSWORD,
})

if (!details.success) {
  const errors = details.error.issues
    .map(({ path, message }) => `${path.join('.')}: ${message}`)
    .join('; ')
  console.error(`Admin bootstrap configuration is invalid: ${errors}`)
  process.exitCode = 1
} else if (process.env.NODE_ENV === 'test') {
  console.error('Admin bootstrap is not available in test mode.')
  process.exitCode = 1
} else {
  try {
    await connectDatabase()
    const existing = await User.exists({ email: details.data.email })
    if (existing) {
      throw new Error('An account with that email already exists; no account was changed.')
    }

    const { password, ...adminFields } = details.data
    await User.create({
      ...adminFields,
      passwordHash: await User.hashPassword(password),
      role: 'admin',
    })
    logger.info({ message: 'Administrator account created', email: details.data.email })
  } catch (error) {
    logger.error({
      message: 'Administrator bootstrap failed',
      failure: error.code === 11000
        ? 'An account with that email already exists.'
        : error.message === 'An account with that email already exists; no account was changed.'
          ? error.message
          : 'Check the database connection and bootstrap fields.',
      errorName: error.name,
      errorCode: error.code,
    })
    process.exitCode = 1
  } finally {
    try {
      await disconnectDatabase()
    } catch (error) {
      logger.error({
        message: 'Database disconnect failed after administrator bootstrap',
        errorName: error.name,
        errorCode: error.code,
      })
      process.exitCode = 1
    }
  }
}
