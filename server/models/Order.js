// server/models/Order.js
const mongoose = require('mongoose');

// Embedded order item schema – captures snapshot of food price at purchase time
const orderItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: false },
  name: { type: String, required: true }, // denormalized for history
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  addons: [
    {
      name: String,
      price: Number,
    },
  ],
  variant: {
    name: String,
    price: Number,
  },
});

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [orderItemSchema],
    address: {
      type: String,
      required: true,
    },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
    paymentMethod: { type: String, enum: ['razorpay', 'cod', 'upi', 'card', 'wallet'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus: {
      type: String,
      enum: [
        'placed',
        'confirmed',
        'preparing',
        'ready',
        'picked_up',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'placed',
    },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    razorpayOrderId: { type: String }, // for linking webhook
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
