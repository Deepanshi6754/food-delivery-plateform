// server/routes/review.js
const express = require('express');
const protect = require('../middleware/auth');
const { createReview, getRestaurantReviews } = require('../controllers/reviewController');

const router = express.Router();

// Get reviews for a specific restaurant (public)
router.get('/restaurants/:id', getRestaurantReviews);

// Create a review (requires auth)
router.post('/', protect, createReview);

module.exports = router;
