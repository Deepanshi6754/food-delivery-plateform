// server/models/Restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, default: '' },
    banner: { type: String, default: '' },
    cuisine: [{ type: String }], // e.g. ['Italian', 'Pizza', 'Pasta']
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    ratingCount: { type: Number, default: 12 },
    deliveryTime: { type: String, default: '25-35 mins' },
    deliveryFee: { type: Number, default: 40 },
    minOrder: { type: Number, default: 150 },
    offer: { type: String, default: '50% OFF up to ₹100' },
    isVegOnly: { type: Boolean, default: false },
    isOpen: { type: Boolean, default: true },
    phone: { type: String, default: '+91 98765 43210' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
