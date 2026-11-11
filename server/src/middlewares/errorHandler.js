import { logger } from '../config/logger.js'
import AppError from '../utils/AppError.js'

export default function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error)
    return
  }

  let normalizedError = error
  if (error instanceof SyntaxError && 'body' in error) {
    normalizedError = new AppError(400, 'INVALID_JSON', 'Request body contains invalid JSON.')
  } else if (error.type === 'entity.too.large') {
    normalizedError = new AppError(413, 'REQUEST_TOO_LARGE', 'Request body exceeds the allowed size.')
  } else if (!(error instanceof AppError) && Number.isInteger(error.status)) {
    normalizedError = new AppError(
      error.status,
      error.status === 413 ? 'REQUEST_TOO_LARGE' : 'INVALID_REQUEST',
      error.status === 413 ? 'Request body exceeds the allowed size.' : 'The request could not be processed.',
    )
  }

  const statusCode = normalizedError.statusCode || 500
  const isExpected = normalizedError instanceof AppError && statusCode < 500
  const context = {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl.split('?')[0],
    statusCode,
    errorCode: normalizedError.code || 'INTERNAL_SERVER_ERROR',
    ...(isExpected
      ? { error: normalizedError.message }
      : {
          errorName: error.name,
          stack: error.stack?.split('\n').slice(1).join('\n'),
        }),
  }

  if (isExpected) {
    logger.warn({ message: 'Request failed', ...context })
  } else {
    logger.error({ message: 'Unhandled request error', ...context })
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: normalizedError.code || 'INTERNAL_SERVER_ERROR',
      message: isExpected ? normalizedError.message : 'An unexpected error occurred.',
      ...(normalizedError.details ? { details: normalizedError.details } : {}),
      requestId: req.id,
    },
  })
}
