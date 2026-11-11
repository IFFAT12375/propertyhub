import AppError from '../utils/AppError.js'

export function serializeUser(user) {
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

export function getCurrentUser(user) {
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'The account could not be found.')
  }
  return serializeUser(user)
}

export async function updateCurrentUser(user, updates) {
  Object.assign(user, updates)
  await user.save()
  return serializeUser(user)
}
