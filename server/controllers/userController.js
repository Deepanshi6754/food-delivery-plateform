// server/controllers/userController.js
const User = require('../models/User');

// @desc Get user addresses
// @route GET /api/users/addresses
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    res.json(user ? user.addresses : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Add address
// @route POST /api/users/addresses
exports.addAddress = async (req, res) => {
  try {
    const { title, street, city, state, zip, isDefault } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push({ title, street, city, state, zip, isDefault: isDefault || user.addresses.length === 0 });
    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update user profile
// @route PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all users (Admin only)
// @route GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
