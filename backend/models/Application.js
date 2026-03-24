import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  occupation: { type: String, required: true, trim: true },
  monthlyIncome: { type: Number, required: true, min: 0 },
  message: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
})

applicationSchema.index({ tenantId: 1, propertyId: 1 }, { unique: true })

export default mongoose.model('Application', applicationSchema)
