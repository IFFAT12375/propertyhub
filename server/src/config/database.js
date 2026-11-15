import mongoose from 'mongoose'
import { env } from './env.js'

let connectionPromise

export function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection)
  }
  if (connectionPromise) {
    return connectionPromise
  }

  connectionPromise = mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
    .then(() => mongoose.connection)
    .finally(() => {
      connectionPromise = null
    })

  return connectionPromise
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}
