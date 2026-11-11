import morgan from 'morgan'
import { logger } from '../config/logger.js'

morgan.token('request-id', (req) => req.id)
morgan.token('safe-url', (req) => req.originalUrl.split('?')[0])

export default morgan(
  ':method :safe-url :status :response-time ms request_id=:request-id',
  {
    stream: {
      write: (message) => logger.info({ message: message.trim(), source: 'http' }),
    },
  },
)
