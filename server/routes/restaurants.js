// server/routes/restaurants.js
const express = require('express');
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Protected routes
router.post('/', protect, authorize(['owner', 'admin']), createRestaurant);
router.put('/:id', protect, authorize(['owner', 'admin']), updateRestaurant);
router.delete('/:id', protect, authorize(['admin']), deleteRestaurant);

module.exports = router;
