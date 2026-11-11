import mongoose from 'mongoose'

const inquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      immutable: true,
    },
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      immutable: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 32, default: '' },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'expired'],
      required: true,
    },
    followUpStatus: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
      required: true,
    },
    verificationTokenHash: {
      type: String,
      select: false,
      default: undefined,
    },
    verificationExpiresAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
)

inquirySchema.index({ property: 1, verificationStatus: 1, createdAt: -1 })
inquirySchema.index({ seeker: 1, createdAt: -1 })
inquirySchema.index(
  { verificationTokenHash: 1 },
  { unique: true, sparse: true },
)

const Inquiry = mongoose.model('Inquiry', inquirySchema)
export default Inquiry
