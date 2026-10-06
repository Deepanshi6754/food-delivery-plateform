// server/routes/deliveryPartner.js
const express = require('express');
const router = express.Router();
const { toggleOnline, getOnlinePartners, updateLocation, acceptOrder } = require('../controllers/deliveryPartnerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All routes require authentication and delivery role
router.use(protect);
router.use(authorize('delivery'));

// Toggle online/offline status
router.post('/online', toggleOnline);

// Get list of online partners (admin/owner may also use, but for simplicity keep delivery role)
router.get('/online', getOnlinePartners);

// Update current partner location
router.put('/location', updateLocation);

// Accept assigned order (partner must be assigned beforehand)
router.post('/orders/:orderId/accept', acceptOrder);

module.exports = router;
