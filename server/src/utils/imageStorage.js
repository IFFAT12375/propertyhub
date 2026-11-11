import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

const serverDirectory = fileURLToPath(new URL('../..', import.meta.url))
export const uploadDirectory = path.resolve(serverDirectory, env.UPLOAD_DIR)
export const stagingDirectory = path.join(uploadDirectory, '.staging')

const extensionByMimeType = Object.freeze({
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
})

export function createImageFilename(mimeType) {
  return `${randomUUID()}${extensionByMimeType[mimeType]}`
}

export async function verifyImageFile(file) {
  const content = await readFile(file.path)
  let valid = false

  if (file.mimetype === 'image/jpeg') {
    valid = content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff
  } else if (file.mimetype === 'image/png') {
    valid = content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  } else if (file.mimetype === 'image/webp') {
    valid =
      content.toString('ascii', 0, 4) === 'RIFF' &&
      content.toString('ascii', 8, 12) === 'WEBP'
  }

  return valid
}

export async function promoteUploads(files) {
  await mkdir(uploadDirectory, { recursive: true })
  const publishedPaths = []

  try {
    for (const file of files) {
      const destination = path.join(uploadDirectory, file.filename)
      await rename(file.path, destination)
      publishedPaths.push(destination)
    }
    return files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    }))
  } catch (error) {
    await cleanupPaths([...publishedPaths, ...files.map(({ path: filePath }) => filePath)])
    throw error
  }
}

async function cleanupPaths(paths) {
  const results = await Promise.allSettled(paths.map((filePath) => unlink(filePath)))
  for (const result of results) {
    if (result.status === 'rejected' && result.reason.code !== 'ENOENT') {
      logger.warn({
        message: 'Could not remove a staged property image',
        error: result.reason.message,
      })
    }
  }
}

export async function cleanupUploads(files = []) {
  await cleanupPaths(files.map(({ path: filePath }) => filePath))
}

export async function removePublishedImages(filenames) {
  const paths = filenames.map((filename) => path.join(uploadDirectory, filename))
  await cleanupPaths(paths)
}

export function imageUrl(filename) {
  return `${env.PUBLIC_API_URL.replace(/\/$/, '')}/uploads/${encodeURIComponent(filename)}`
}
