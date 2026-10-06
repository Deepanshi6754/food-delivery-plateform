// server/controllers/foodController.js
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');

// @desc Get food items (optionally filter by restaurant or category)
// @route GET /api/foods
exports.getFoods = async (req, res) => {
  try {
    const { restaurant, category, search } = req.query;
    let query = {};
    if (restaurant) query.restaurant = restaurant;
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const foods = await Food.find(query).populate('restaurant', 'name address');
    res.json(foods);
  } catch (err) {
    console.error('getFoods error:', err);
    res.status(500).json({ message: 'Server error fetching foods' });
  }
};

// @desc Get single food item
// @route GET /api/foods/:id
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate('restaurant', 'name address');
    if (!food) return res.status(404).json({ message: 'Food item not found' });
    res.json(food);
  } catch (err) {
    console.error('getFoodById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Create food item
// @route POST /api/foods
// @access Private (owner, admin)
exports.createFood = async (req, res) => {
  try {
    const { name, description, price, restaurant, category, image, isVeg, addons, preparationTime } = req.body;
    if (!name || price === undefined || !restaurant) {
      return res.status(400).json({ message: 'Name, price, and restaurant are required' });
    }

    const rest = await Restaurant.findById(restaurant);
    if (!rest) return res.status(404).json({ message: 'Restaurant not found' });

    if (req.user.role !== 'admin' && rest.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this restaurant' });
    }

    const food = await Food.create({
      name,
      description,
      price: Number(price),
      restaurant,
      category: category || 'Main Course',
      image: image || '',
      isVeg: !!isVeg,
      addons: addons || [],
      preparationTime: preparationTime || 20,
    });

    res.status(201).json(food);
  } catch (err) {
    console.error('createFood error:', err);
    res.status(500).json({ message: 'Server error creating food' });
  }
};

// @desc Update food item
// @route PUT /api/foods/:id
// @access Private (owner, admin)
exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food not found' });

    const rest = await Restaurant.findById(food.restaurant);
    if (rest && req.user.role !== 'admin' && rest.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    Object.assign(food, req.body);
    await food.save();
    res.json(food);
  } catch (err) {
    console.error('updateFood error:', err);
    res.status(500).json({ message: 'Server error updating food' });
  }
};

// @desc Delete food item
// @route DELETE /api/foods/:id
// @access Private (owner, admin)
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food not found' });

    const rest = await Restaurant.findById(food.restaurant);
    if (rest && req.user.role !== 'admin' && rest.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await food.deleteOne();
    res.json({ message: 'Food item deleted successfully' });
  } catch (err) {
    console.error('deleteFood error:', err);
    res.status(500).json({ message: 'Server error deleting food' });
  }
};
