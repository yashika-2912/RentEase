import mongoose from 'mongoose'

const rentPaymentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    month: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.model('RentPayment', rentPaymentSchema)
