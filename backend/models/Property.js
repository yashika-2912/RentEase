import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    rent: { type: Number, required: true, min: 1 },
    location: { type: String, required: true, trim: true },
    images: [{ type: String }],
    status: { type: String, enum: ['vacant', 'occupied'], default: 'vacant' },
    landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

export default mongoose.model('Property', propertySchema)
