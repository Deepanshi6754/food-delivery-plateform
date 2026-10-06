// server/routes/foods.js
const express = require('express');
const {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

router.get('/', getFoods);
router.get('/:id', getFoodById);

// Protected routes
router.post('/', protect, authorize(['owner', 'admin']), createFood);
router.put('/:id', protect, authorize(['owner', 'admin']), updateFood);
router.delete('/:id', protect, authorize(['owner', 'admin']), deleteFood);

module.exports = router;
