import mongoose from 'mongoose'

const authSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    refreshTokenHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    replacedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthSession',
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
)

authSessionSchema.index({ refreshTokenHash: 1 }, { unique: true })
authSessionSchema.index({ user: 1, revokedAt: 1, expiresAt: 1 })

const AuthSession = mongoose.model('AuthSession', authSessionSchema)
export default AuthSession
