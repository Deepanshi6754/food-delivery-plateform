// server/controllers/restaurantController.js
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');

// @desc Get all restaurants with search and category filters
// @route GET /api/restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cuisine: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category && category !== 'All') {
      query.cuisine = { $in: [new RegExp(category, 'i')] };
    }

    let sortOption = { rating: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'deliveryFee') sortOption = { deliveryFee: 1 };
    if (sort === 'name') sortOption = { name: 1 };

    const restaurants = await Restaurant.find(query).sort(sortOption);
    res.json(restaurants);
  } catch (err) {
    console.error('getRestaurants error:', err);
    res.status(500).json({ message: 'Server error fetching restaurants' });
  }
};

// @desc Get restaurant by id with its menu items
// @route GET /api/restaurants/:id
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const foods = await Food.find({ restaurant: restaurant._id, isAvailable: true });
    res.json({
      ...restaurant.toObject(),
      foods,
    });
  } catch (err) {
    console.error('getRestaurantById error:', err);
    res.status(500).json({ message: 'Server error fetching restaurant' });
  }
};

// @desc Create new restaurant
// @route POST /api/restaurants
// @access Private (owner, admin)
exports.createRestaurant = async (req, res) => {
  try {
    const { name, description, address, image, banner, cuisine, deliveryTime, deliveryFee, minOrder, offer, isVegOnly } = req.body;
    const restaurant = await Restaurant.create({
      name,
      description,
      address,
      owner: req.user.id,
      image,
      banner,
      cuisine: Array.isArray(cuisine) ? cuisine : cuisine ? [cuisine] : ['Multi-Cuisine'],
      deliveryTime: deliveryTime || '25-35 mins',
      deliveryFee: deliveryFee !== undefined ? deliveryFee : 40,
      minOrder: minOrder || 150,
      offer: offer || '20% OFF',
      isVegOnly: !!isVegOnly,
    });

    res.status(201).json(restaurant);
  } catch (err) {
    console.error('createRestaurant error:', err);
    res.status(500).json({ message: 'Server error creating restaurant' });
  }
};

// @desc Update restaurant
// @route PUT /api/restaurants/:id
// @access Private (owner, admin)
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    if (req.user.role !== 'admin' && restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }

    Object.assign(restaurant, req.body);
    await restaurant.save();
    res.json(restaurant);
  } catch (err) {
    console.error('updateRestaurant error:', err);
    res.status(500).json({ message: 'Server error updating restaurant' });
  }
};

// @desc Delete restaurant
// @route DELETE /api/restaurants/:id
// @access Private (admin)
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    await Food.deleteMany({ restaurant: restaurant._id });
    await restaurant.deleteOne();
    res.json({ message: 'Restaurant and menu items removed' });
  } catch (err) {
    console.error('deleteRestaurant error:', err);
    res.status(500).json({ message: 'Server error deleting restaurant' });
  }
};
