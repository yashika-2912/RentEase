import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    rent: { type: Number, required: true, min: 1 },
    location: { type: String, required: true, trim: true },
    bedrooms: { type: Number, default: 1, min: 0 },
    bathrooms: { type: Number, default: 1, min: 0 },
    type: {
      type: String,
      enum: ['apartment', 'house', 'villa', 'studio', 'commercial'],
      default: 'apartment',
    },
    amenities: [{ type: String, trim: true }],
    images: [{ type: String }],
    status: { type: String, enum: ['vacant', 'occupied'], default: 'vacant' },
    landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

propertySchema.index({ location: 1, status: 1 })
propertySchema.index({ type: 1, rent: 1 })

export default mongoose.model('Property', propertySchema)
