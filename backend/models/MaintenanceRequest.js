import mongoose from 'mongoose'

const maintenanceRequestSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
  },
  { timestamps: true }
)

maintenanceRequestSchema.index({ landlordId: 1, status: 1, createdAt: -1 })
maintenanceRequestSchema.index({ tenantId: 1, createdAt: -1 })

export default mongoose.model('MaintenanceRequest', maintenanceRequestSchema)
