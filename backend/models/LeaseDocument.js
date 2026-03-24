import mongoose from 'mongoose'

const leaseDocumentSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
})

export default mongoose.model('LeaseDocument', leaseDocumentSchema)
