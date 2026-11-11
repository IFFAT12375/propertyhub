import AppError from '../utils/AppError.js'
import { cleanupUploads } from '../utils/imageStorage.js'

export default function validate(schemas) {
  return async (req, _res, next) => {
    const validated = {}
    const issues = []

    for (const key of ['params', 'query', 'body']) {
      if (!schemas[key]) continue
      const result = schemas[key].safeParse(req[key])
      if (result.success) {
        validated[key] = result.data
      } else {
        issues.push(
          ...result.error.issues.map((issue) => ({
            field: [key, ...issue.path].join('.'),
            message: issue.message,
            code: issue.code,
          })),
        )
      }
    }

    if (issues.length) {
      await cleanupUploads(req.files)
      next(
        new AppError(
          400,
          'VALIDATION_ERROR',
          'One or more request fields are invalid.',
          issues,
        ),
      )
      return
    }

    req.validated = validated
    next()
  }
}
