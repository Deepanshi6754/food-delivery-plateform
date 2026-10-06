// server/controllers/cartController.js
const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Coupon = require('../models/Coupon');

// Helper to recalculate cart totals
const calculateTotals = async (cart) => {
  let subtotal = 0;
  for (const item of cart.items) {
    if (!item.food) continue;
    const food = await Food.findById(item.food).select('price');
    if (food) subtotal += food.price * item.quantity;
  }
  cart.subtotal = Number(subtotal.toFixed(2));

  // 5% tax and 40 delivery fee
  cart.tax = Number((subtotal * 0.05).toFixed(2));
  cart.deliveryFee = subtotal > 0 ? (subtotal > 499 ? 0 : 40) : 0; // Free delivery over ₹499!

  // Discount from coupon if applied
  let discount = 0;
  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon);
    if (coupon && coupon.isActive) {
      if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
      } else if (coupon.type === 'fixed') {
        discount = coupon.value;
      }
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }
  }
  cart.discount = Number(discount.toFixed(2));

  const finalTotal = Math.max(0, subtotal + cart.tax + cart.deliveryFee - cart.discount);
  cart.total = Number(finalTotal.toFixed(2));
  await cart.save();
  return cart;
};

// @desc Get current user's cart
// @route GET /api/cart
// @access Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.food', 'name price image restaurant isVeg')
      .populate('coupon');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    await calculateTotals(cart);
    // Reload populated
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.food', 'name price image restaurant isVeg')
      .populate('coupon');

    res.json(cart);
  } catch (err) {
    console.error('getCart error:', err);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

// @desc Add item to cart
// @route POST /api/cart/add
// @access Private
exports.addItem = async (req, res) => {
  const { foodId, quantity = 1, specialInstructions } = req.body;
  try {
    if (!foodId) return res.status(400).json({ message: 'foodId is required' });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

    const existingIndex = cart.items.findIndex((i) => i.food && i.food.toString() === foodId.toString());
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
      if (specialInstructions) cart.items[existingIndex].specialInstructions = specialInstructions;
    } else {
      cart.items.push({ food: foodId, quantity: Number(quantity), specialInstructions });
    }

    await cart.save();
    await calculateTotals(cart);

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate('items.food', 'name price image restaurant isVeg')
      .populate('coupon');

    res.json(updatedCart);
  } catch (err) {
    console.error('addItem error:', err);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

// @desc Update quantity or instructions for a cart item
// @route PUT /api/cart/item/:itemId
// @access Private
exports.updateItem = async (req, res) => {
  const { quantity, specialInstructions } = req.body;
  const { itemId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity !== undefined) {
      if (quantity <= 0) {
        cart.items.pull(itemId);
      } else {
        item.quantity = Number(quantity);
      }
    }
    if (specialInstructions !== undefined) item.specialInstructions = specialInstructions;

    await cart.save();
    await calculateTotals(cart);

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate('items.food', 'name price image restaurant isVeg')
      .populate('coupon');

    res.json(updatedCart);
  } catch (err) {
    console.error('updateItem error:', err);
    res.status(500).json({ message: 'Server error updating cart item' });
  }
};

// @desc Remove an item from the cart
// @route DELETE /api/cart/item/:itemId
// @access Private
exports.removeItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items.pull(itemId);
    await cart.save();
    await calculateTotals(cart);

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate('items.food', 'name price image restaurant isVeg')
      .populate('coupon');

    res.json(updatedCart);
  } catch (err) {
    console.error('removeItem error:', err);
    res.status(500).json({ message: 'Server error removing cart item' });
  }
};

// @desc Apply coupon code
// @route POST /api/cart/apply-coupon
// @access Private
exports.applyCoupon = async (req, res) => {
  const { couponCode } = req.body;
  try {
    if (!couponCode) return res.status(400).json({ message: 'Coupon code required' });

    const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
    if (!coupon) return res.status(400).json({ message: 'Invalid or expired coupon' });

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    if (cart.subtotal < (coupon.minOrderValue || 0)) {
      return res.status(400).json({ message: `Minimum order of ₹${coupon.minOrderValue} required for this coupon` });
    }

    cart.coupon = coupon._id;
    await cart.save();
    await calculateTotals(cart);

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate('items.food', 'name price image restaurant isVeg')
      .populate('coupon');

    res.json(updatedCart);
  } catch (err) {
    console.error('applyCoupon error:', err);
    res.status(500).json({ message: 'Server error applying coupon' });
  }
};

// @desc Remove coupon from cart
// @route POST /api/cart/remove-coupon
// @access Private
exports.removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.coupon = undefined;
    await cart.save();
    await calculateTotals(cart);

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate('items.food', 'name price image restaurant isVeg')
      .populate('coupon');

    res.json(updatedCart);
  } catch (err) {
    console.error('removeCoupon error:', err);
    res.status(500).json({ message: 'Server error removing coupon' });
  }
};

// @desc Clear all items from cart
// @route DELETE /api/cart
// @access Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    cart.coupon = undefined;
    cart.subtotal = 0;
    cart.tax = 0;
    cart.deliveryFee = 0;
    cart.discount = 0;
    cart.total = 0;
    await cart.save();

    res.json({ message: 'Cart cleared successfully', cart });
  } catch (err) {
    console.error('clearCart error:', err);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
};

