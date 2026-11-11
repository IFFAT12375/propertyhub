import mongoose from 'mongoose'
import {
  lahoreAreas,
  propertyTypesByCategory,
} from '../config/propertyOptions.js'

const propertyImageSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true, maxlength: 255 },
    mimeType: {
      type: String,
      enum: ['image/jpeg', 'image/png', 'image/webp'],
      required: true,
    },
    size: { type: Number, required: true, min: 1, max: 5 * 1024 * 1024 },
    order: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    title: { type: String, trim: true, maxlength: 180 },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    category: {
      type: String,
      enum: ['residential', 'commercial'],
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(propertyTypesByCategory).flat(),
      required: true,
    },
    purpose: {
      type: String,
      enum: ['sale', 'rent'],
      required: true,
    },
    price: { type: Number, required: true, min: 1 },
    priceFrequency: {
      type: String,
      enum: ['month', 'year', null],
      default: null,
    },
    area: { type: Number, required: true, min: 1 },
    areaUnit: {
      type: String,
      enum: ['marla', 'kanal', 'sq ft'],
      required: true,
    },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    location: {
      area: { type: String, enum: lahoreAreas, required: true },
      city: { type: String, enum: ['Lahore'], default: 'Lahore', required: true },
      block: { type: String, trim: true, maxlength: 100 },
      street: { type: String, trim: true, maxlength: 160 },
      address: { type: String, trim: true, maxlength: 500 },
    },
    images: {
      type: [propertyImageSchema],
      default: [],
      validate: {
        validator: (images) => images.length >= 1 && images.length <= 10,
        message: 'A property must include between 1 and 10 images.',
      },
    },
    phoneVisible: { type: Boolean, default: true, required: true },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'sold', 'rented', 'inactive'],
      default: 'available',
      required: true,
    },
    recordStatus: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
      required: true,
    },
    rejectionReason: { type: String, trim: true, maxlength: 2000, default: '' },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
)

propertySchema.pre('validate', function validatePropertyRules() {
  const allowedTypes = propertyTypesByCategory[this.category]
  if (allowedTypes && !allowedTypes.includes(this.type)) {
    this.invalidate('type', 'Property type does not match the selected category.')
  }
  if (this.purpose === 'rent' && !this.priceFrequency) {
    this.invalidate('priceFrequency', 'Rental listings require a billing period.')
  }
  if (this.purpose === 'sale' && this.priceFrequency) {
    this.invalidate('priceFrequency', 'Sale listings cannot have a rental billing period.')
  }
  if (
    (this.purpose === 'sale' && this.availabilityStatus === 'rented') ||
    (this.purpose === 'rent' && this.availabilityStatus === 'sold')
  ) {
    this.invalidate(
      'availabilityStatus',
      'Availability status must match the listing purpose.',
    )
  }
})

propertySchema.index({ owner: 1, recordStatus: 1, createdAt: -1 })
propertySchema.index({ moderationStatus: 1, createdAt: 1 })
propertySchema.index({
  'location.area': 1,
  purpose: 1,
  category: 1,
  type: 1,
  price: 1,
  createdAt: -1,
})

const Property = mongoose.model('Property', propertySchema)
export default Property
