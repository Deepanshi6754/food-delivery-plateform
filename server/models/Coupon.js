// server/models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true }, // discount type
  value: { type: Number, required: true }, // percentage (e.g., 10) or fixed amount
  maxDiscount: { type: Number }, // optional cap for percentage discounts
  minOrderValue: { type: Number, default: 0 }, // minimum cart subtotal required
  usageLimit: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Coupon', couponSchema);
