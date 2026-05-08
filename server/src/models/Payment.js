const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    lease: { type: mongoose.Schema.Types.ObjectId, ref: 'Lease', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'failed'],
      default: 'pending',
    },
    stripePaymentIntentId: { type: String, default: '' },
    paidAt: { type: Date },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
