const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'RentEase' },
    contactEmail: { type: String, default: '' },
    supportPhone: { type: String, default: '' },
    stripeMode: { type: String, enum: ['test', 'live'], default: 'test' },
    smtpConfigured: { type: Boolean, default: false },
    rentDueDay: { type: Number, default: 1, min: 1, max: 28 },
    autoReminderEmail: { type: Boolean, default: true },
    maintenanceSlaDays: { type: Number, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
