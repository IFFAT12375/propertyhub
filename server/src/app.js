import express from 'express'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { env } from './config/env.js'
import AppError from './utils/AppError.js'
import errorHandler from './middlewares/errorHandler.js'
import notFound from './middlewares/notFound.js'
import requestId from './middlewares/requestId.js'
import requestLogger from './middlewares/requestLogger.js'

const app = express()

app.disable('x-powered-by')
app.use(requestId)
app.use(requestLogger)
app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) {
        callback(null, true)
        return
      }
      callback(new AppError(403, 'CORS_ORIGIN_DENIED', 'This origin is not allowed.'))
    },
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    optionsSuccessStatus: 204,
  }),
)

const apiRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler(_req, _res, next) {
    next(
      new AppError(
        429,
        'RATE_LIMIT_EXCEEDED',
        'Too many requests. Please try again later.',
      ),
    )
  },
})

function healthCheck(req, res) {
  res.status(200).json({
    success: true,
    message: 'PropertyHub API is running',
    requestId: req.id,
  })
}

function readinessCheck(req, res) {
  const databaseReady = mongoose.connection.readyState === 1
  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    data: {
      status: databaseReady ? 'ready' : 'not_ready',
      database: databaseReady ? 'connected' : 'unavailable',
    },
    requestId: req.id,
  })
}

app.get('/api/health', healthCheck)
app.get('/api/v1/health', healthCheck)
app.get('/api/v1/health/ready', readinessCheck)
app.use('/api/v1', apiRateLimit)
app.use(express.json({ limit: env.JSON_BODY_LIMIT }))

app.use(notFound)
app.use(errorHandler)

export default app
