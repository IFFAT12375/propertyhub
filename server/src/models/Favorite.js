import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      immutable: true,
    },
  },
  { timestamps: true, versionKey: false },
)

favoriteSchema.index({ user: 1, property: 1 }, { unique: true })
favoriteSchema.index({ user: 1, createdAt: -1 })

const Favorite = mongoose.model('Favorite', favoriteSchema)
export default Favorite
