// server/routes/cart.js
const express = require('express');
const protect = require('../middleware/auth');
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  applyCoupon,
  removeCoupon,
  clearCart,
} = require('../controllers/cartController');

const router = express.Router();

// All cart endpoints require authentication
router.use(protect);

router.get('/', getCart);
router.delete('/', clearCart);
router.post('/add', addItem);
router.put('/item/:itemId', updateItem);
router.delete('/item/:itemId', removeItem);
router.post('/apply-coupon', applyCoupon);
router.post('/remove-coupon', removeCoupon);

module.exports = router;
