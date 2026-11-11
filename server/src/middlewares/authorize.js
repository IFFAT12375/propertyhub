import AppError from '../utils/AppError.js'

export default function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required.'))
      return
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(403, 'FORBIDDEN', 'You are not allowed to perform this action.'))
      return
    }
    if (
      req.user.role === 'seller' &&
      req.user.accountStatus !== 'active' &&
      allowedRoles.includes('seller')
    ) {
      next(new AppError(403, 'SELLER_SUSPENDED', 'Seller features are unavailable for this account.'))
      return
    }
    next()
  }
}
