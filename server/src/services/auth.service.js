import AuthSession from '../models/AuthSession.js'
import User from '../models/User.js'
import { env } from '../config/env.js'
import AppError from '../utils/AppError.js'
import {
  createAccessToken,
  createOpaqueToken,
  hashToken,
} from '../utils/tokens.js'

const publicUserFields = 'name email phone role accountStatus createdAt updatedAt'

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function createExpiry() {
  return new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
}

async function issueSession(user) {
  const refreshToken = createOpaqueToken()
  const session = await AuthSession.create({
    user: user._id,
    refreshTokenHash: hashToken(refreshToken),
    expiresAt: createExpiry(),
  })

  return {
    accessToken: createAccessToken(user.id, session.id),
    refreshToken,
    user: serializeUser(user),
  }
}

export async function register({ name, email, phone, password }) {
  const passwordHash = await User.hashPassword(password)
  try {
    const user = await User.create({ name, email, phone, passwordHash })
    return serializeUser(user)
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      throw new AppError(409, 'EMAIL_ALREADY_REGISTERED', 'An account with this email already exists.')
    }
    throw error
  }
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user || !(await user.verifyPassword(password))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
  }
  return issueSession(user)
}

export async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'A valid refresh token is required.')
  }

  const currentTokenHash = hashToken(refreshToken)
  const currentSession = await AuthSession.findOne({
    refreshTokenHash: currentTokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })

  if (!currentSession) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'A valid refresh token is required.')
  }

  const user = await User.findById(currentSession.user).select(publicUserFields)
  if (!user) {
    await AuthSession.updateOne(
      { _id: currentSession._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    )
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'A valid refresh token is required.')
  }

  const replacementToken = createOpaqueToken()
  const rotatedSession = await AuthSession.findOneAndUpdate(
    {
      _id: currentSession._id,
      refreshTokenHash: currentTokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        refreshTokenHash: hashToken(replacementToken),
        expiresAt: createExpiry(),
      },
    },
    { returnDocument: 'after', runValidators: true },
  )

  if (!rotatedSession) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'A valid refresh token is required.')
  }

  return {
    accessToken: createAccessToken(user.id, rotatedSession.id),
    refreshToken: replacementToken,
    user: serializeUser(user),
  }
}

export async function logout(refreshToken) {
  if (!refreshToken) return
  await AuthSession.updateOne(
    { refreshTokenHash: hashToken(refreshToken), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  )
}
