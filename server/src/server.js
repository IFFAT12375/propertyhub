import { pathToFileURL } from 'node:url'
import app from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'

export async function startServer() {
  await connectDatabase()

  let httpServer
  try {
    httpServer = await new Promise((resolve, reject) => {
      const listener = app.listen(env.PORT, () => resolve(listener))
      listener.once('error', reject)
    })
  } catch (error) {
    try {
      await disconnectDatabase()
    } catch (disconnectError) {
      logger.error({
        message: 'MongoDB disconnect failed after HTTP startup failure',
        errorName: disconnectError.name,
      })
    }
    throw error
  }

  httpServer.on('error', (error) => {
    logger.error({
      message: 'HTTP server error',
      errorName: error.name,
      errorCode: error.code,
    })
  })

  logger.info({ message: 'PropertyHub API listening', port: env.PORT })

  let shuttingDown = false
  const shutdown = (signal) => {
    if (shuttingDown) return
    shuttingDown = true
    logger.info({ message: 'Shutting down PropertyHub API', signal })

    const forceShutdownTimer = setTimeout(() => {
      logger.error({ message: 'Forced shutdown after timeout', signal })
      process.exit(1)
    }, 10_000)
    forceShutdownTimer.unref()

    httpServer.close(async (error) => {
      try {
        await disconnectDatabase()
        if (error) {
          logger.error({
            message: 'HTTP server did not close cleanly',
            errorName: error.name,
            errorCode: error.code,
          })
          process.exitCode = 1
        } else {
          logger.info({ message: 'PropertyHub API shutdown complete' })
        }
      } catch (disconnectError) {
        logger.error({
          message: 'MongoDB disconnect failed during shutdown',
          errorName: disconnectError.name,
          errorCode: disconnectError.code,
        })
        process.exitCode = 1
      } finally {
        clearTimeout(forceShutdownTimer)
      }
    })
  }

  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))

  return httpServer
}

const isEntrypoint =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isEntrypoint) {
  startServer().catch((error) => {
    logger.error({
      message: 'PropertyHub API failed to start',
      errorName: error.name,
      errorCode: error.code,
    })
    process.exitCode = 1
  })
}
