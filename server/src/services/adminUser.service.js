import User from '../models/User.js'
import AppError from '../utils/AppError.js'

function pagination(page, limit, totalItems) {
  return {
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  }
}

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
  }
}

export async function listUsers({ page, limit, role, accountStatus }) {
  const filter = {}
  if (role) filter.role = role
  if (accountStatus) filter.accountStatus = accountStatus

  const [users, totalItems] = await Promise.all([
    User.find(filter)
      .select('name email phone role accountStatus createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ])
  return {
    users: users.map(serializeUser),
    pagination: pagination(page, limit, totalItems),
  }
}

export async function updateSellerAccountStatus(userId, accountStatus) {
  const user = await User.findOneAndUpdate(
    { _id: userId, role: 'seller' },
    { $set: { accountStatus } },
    { returnDocument: 'after', runValidators: true },
  )

  if (!user) {
    throw new AppError(404, 'SELLER_NOT_FOUND', 'Approved seller account not found.')
  }
  return serializeUser(user)
}
