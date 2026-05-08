const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['apartment', 'house', 'studio', 'villa', 'pg'],
      default: 'apartment',
    },
    rent: { type: Number, required: true },
    deposit: { type: Number, default: 0 },
    availableFrom: { type: Date },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        lat: { type: Number, default: 19.076 },
        lng: { type: Number, default: 72.8777 },
      },
    },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    area: { type: Number, default: 0 },
    amenities: [{ type: String }],
    furnished: { type: Boolean, default: false },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    rejectionReason: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

module.exports = mongoose.model('Property', propertySchema);
