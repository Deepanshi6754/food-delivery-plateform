// server/models/DeliveryPartner.js
const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documents: [{ type: String }], // URLs to uploaded verification docs
    isVerified: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false }, // availability for deliveries
    vehicleInfo: {
      type: String,
    },
    earnings: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    // GeoJSON point for real‑time tracking
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  { timestamps: true }
);

// 2dsphere index for geo queries
deliveryPartnerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
