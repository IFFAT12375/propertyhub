import multer from 'multer'
import { mkdir } from 'node:fs/promises'
import AppError from '../utils/AppError.js'
import {
  cleanupUploads,
  createImageFilename,
  stagingDirectory,
  verifyImageFile,
} from '../utils/imageStorage.js'

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    mkdir(stagingDirectory, { recursive: true })
      .then(() => callback(null, stagingDirectory))
      .catch(callback)
  },
  filename(_req, file, callback) {
    callback(null, createImageFilename(file.mimetype))
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
    fields: 20,
    fieldSize: 64 * 1024,
    parts: 30,
  },
  fileFilter(_req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError(
        400,
        'UNSUPPORTED_IMAGE_TYPE',
        'Images must be JPG, PNG, or WebP files.',
      ))
      return
    }
    callback(null, true)
  },
})

export default function uploadPropertyImages(req, res, next) {
  upload.array('images', 10)(req, res, async (uploadError) => {
    if (uploadError) {
      await cleanupUploads(req.files)
      if (uploadError instanceof multer.MulterError) {
        const statusCode = uploadError.code === 'LIMIT_FILE_SIZE' ? 413 : 400
        next(new AppError(
          statusCode,
          uploadError.code,
          statusCode === 413
            ? 'Each property image must be no larger than 5 MB.'
            : 'The uploaded images exceed the supported count or form limits.',
        ))
        return
      }
      next(uploadError)
      return
    }

    const files = req.files ?? []
    try {
      for (const file of files) {
        if (!(await verifyImageFile(file))) {
          throw new AppError(
            400,
            'INVALID_IMAGE_CONTENT',
            'An uploaded file does not match its declared image type.',
          )
        }
      }
      next()
    } catch (error) {
      await cleanupUploads(files)
      next(error)
    }
  })
}
