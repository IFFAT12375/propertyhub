import AppError from '../utils/AppError.js'

export default function notFound(req, res, next) {
  next(
    new AppError(
      404,
      'ROUTE_NOT_FOUND',
      `No route found for ${req.method} ${req.originalUrl.split('?')[0]}.`,
    ),
  )
}
