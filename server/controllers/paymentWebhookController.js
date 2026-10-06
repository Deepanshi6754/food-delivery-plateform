// server/controllers/paymentWebhookController.js
const crypto = require('crypto');
const Order = require('../models/Order');
require('dotenv').config();

/**
 * Razorpay webhook handler – verifies signature and updates order payment status.
 * Expected payload (simplified):
 *   {
 *     "event": "payment.captured",
 *     "payload": {
 *       "payment": { "entity": { "order_id": "razorpay_order_id", "status": "captured" } }
 *     }
 *   }
 */
exports.handleRazorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));

  // If webhook secret is configured, verify HMAC SHA256 signature
  if (secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('⚠️ Razorpay webhook signature mismatch');
      return res.status(400).json({ message: 'Invalid signature' });
    }
  }

  const { event, payload } = req.body;
  if (event !== 'payment.captured') {
    return res.json({ received: true }); // ignore other events
  }

  const razorpayOrderId = payload.payment.entity.order_id;
  try {
    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.paymentStatus = 'paid';
    await order.save();
    // Emit real‑time update
    if (req.app.get('io')) {
      req.app.get('io').emit('paymentSuccess', { orderId: order._id });
    }
    res.json({ status: 'updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
