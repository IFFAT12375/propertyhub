import mongoose from 'mongoose'

const sellerApplicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    sellerType: {
      type: String,
      enum: ['owner', 'agent'],
      required: true,
    },
    agencyName: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
)

sellerApplicationSchema.pre('validate', function validateAgencyName() {
  if (this.sellerType === 'agent' && !this.agencyName?.trim()) {
    this.invalidate('agencyName', 'Agency name is required for agent applications.')
  }
})

sellerApplicationSchema.index({ status:  1, createdAt: 1 })
sellerApplicationSchema.index({ applicant: 1, createdAt: -1 })
sellerApplicationSchema.index(
  { applicant: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } },
)

const SellerApplication = mongoose.model(
  'SellerApplication',
  sellerApplicationSchema,
)
export default SellerApplication
