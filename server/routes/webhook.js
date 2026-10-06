// server/routes/webhook.js
const express = require('express');
const router = express.Router();
const { handleRazorpayWebhook } = require('../controllers/paymentWebhookController');

// Razorpay webhook endpoint – server.js captures req.rawBody and parses req.body
router.post('/razorpay', handleRazorpayWebhook);

module.exports = router;
