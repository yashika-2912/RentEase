import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  sentAt: { type: Date, default: Date.now },
})

messageSchema.index({ propertyId: 1, sentAt: 1 })

export default mongoose.model('Message', messageSchema)
