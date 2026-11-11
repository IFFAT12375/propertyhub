import { Types } from 'mongoose'
import AuthSession from '../models/AuthSession.js'
import User from '../models/User.js'
import AppError from '../utils/AppError.js'
import { verifyAccessToken } from '../utils/tokens.js'

export default async function authenticate(req, _res, next) {
  const authorization = req.get('authorization')
  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'A valid access token is required.'))
    return
  }

  let payload
  try {
    payload = verifyAccessToken(authorization.slice(7))
  } catch {
    next(new AppError(401, 'INVALID_ACCESS_TOKEN', 'The access token is invalid or expired.'))
    return
  }

  if (
    typeof payload.sub !== 'string' ||
    typeof payload.sid !== 'string' ||
    !Types.ObjectId.isValid(payload.sub) ||
    !Types.ObjectId.isValid(payload.sid)
  ) {
    next(new AppError(401, 'INVALID_ACCESS_TOKEN', 'The access token is invalid or expired.'))
    return
  }

  const [user, session] = await Promise.all([
    User.findById(payload.sub).select('name email phone role accountStatus createdAt updatedAt'),
    AuthSession.findOne({
      _id: payload.sid,
      user: payload.sub,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }),
  ])

  if (!user || !session) {
    next(new AppError(401, 'INVALID_ACCESS_TOKEN', 'The access token is invalid or expired.'))
    return
  }

  req.user = user
  req.authSessionId = session.id
  next()
}
