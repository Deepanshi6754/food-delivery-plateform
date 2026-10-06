// server/controllers/adminController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');

/**
 * GET /api/admin/stats
 * Returns aggregated platform statistics.
 */
exports.getStats = async (req, res) => {
  try {
    const [totalOrders, totalRevenue, totalUsers, totalRestaurants] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
      User.countDocuments(),
      Restaurant.countDocuments(),
    ]);
    const revenue = totalRevenue[0] ? totalRevenue[0].sum : 0;
    res.json({ totalOrders, totalRevenue: revenue, totalUsers, totalRestaurants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
