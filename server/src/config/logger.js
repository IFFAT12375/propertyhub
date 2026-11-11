import { createLogger, format, transports } from 'winston'
import { env } from './env.js'

export const logger = createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: 'propertyhub-api' },
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [new transports.Console()],
})
