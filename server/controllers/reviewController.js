// server/controllers/reviewController.js
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

/**
 * POST /api/reviews
 * Customer creates a review for a restaurant.
 */
exports.createReview = async (req, res) => {
  const { restaurantId, rating, comment } = req.body;
  if (!restaurantId || typeof rating !== 'number') {
    return res.status(400).json({ message: 'restaurantId and rating are required' });
  }
  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const review = await Review.create({
      restaurant: restaurantId,
      customer: req.user.id,
      rating,
      comment,
    });

    // Update restaurant rating aggregates
    const agg = await Review.aggregate([
      { $match: { restaurant: restaurant._id } },
      { $group: { _id: '$restaurant', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (agg.length) {
      restaurant.rating = agg[0].avgRating;
      restaurant.ratingCount = agg[0].count;
      await restaurant.save();
    }
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/restaurants/:id/reviews
 * Fetch all reviews for a restaurant.
 */
exports.getRestaurantReviews = async (req, res) => {
  const { id } = req.params;
  try {
    const reviews = await Review.find({ restaurant: id })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
