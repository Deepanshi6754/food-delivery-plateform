// server/routes/orders.js
const express = require('express');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  createOrder,
  getOrderById,
  getMyOrders,
  updateStatus,
  advanceStatus,
  getOrders,
  assignDeliveryPartner,
} = require('../controllers/orderController');

const router = express.Router();

// Customer fetches own orders (protected)
router.get('/my', protect, getMyOrders);

// Get single order by ID (public / tracking link access)
router.get('/:id', getOrderById);

// Protected routes below
router.use(protect);

// Customer creates an order
router.post('/', createOrder);

// Owner/Delivery/Admin can fetch orders list
router.get('/', authorize(['owner', 'delivery', 'admin']), getOrders);

// Update order status
router.patch('/:id/status', updateStatus);

// Helper to advance status during testing
router.post('/:id/advance', advanceStatus);

// Assign delivery partner
router.patch('/:id/assign', assignDeliveryPartner);

module.exports = router;
