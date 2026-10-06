// server/config/razorpay.js
require('dotenv').config();

let razorpayInstance = null;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (e) {
  console.log('Razorpay package not configured or missing keys. Running in simulated payment mode.');
}

// Resilient fallback implementation
if (!razorpayInstance) {
  razorpayInstance = {
    orders: {
      create: async (options) => {
        return {
          id: `order_sim_${Date.now()}`,
          entity: 'order',
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: options.currency || 'INR',
          receipt: options.receipt,
          status: 'created',
          attempts: 0,
          created_at: Math.floor(Date.now() / 1000),
        };
      },
    },
  };
}

module.exports = razorpayInstance;
