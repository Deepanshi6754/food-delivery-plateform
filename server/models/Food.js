// server/models/Food.js
const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const addonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    category: {
      type: String,
      default: 'Main Course',
      trim: true,
    },
    image: { type: String, default: '' },
    isVeg: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    addons: [addonSchema],
    variants: [variantSchema],
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    ratingCount: { type: Number, default: 1 },
    preparationTime: { type: Number, default: 20 }, // in minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model('Food', foodSchema);
