// server/controllers/orderController.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const razorpayInstance = require('../config/razorpay');

// @desc Create a new order
// @route POST /api/orders
// @access Private
exports.createOrder = async (req, res) => {
  const { address, paymentMethod = 'cod', items: directItems, total: directTotal } = req.body;
  try {
    let orderItems = [];
    let subtotal = 0;
    let restaurantId = null;

    if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      // Direct checkout from client state
      for (const item of directItems) {
        const foodId = item._id || item.food;
        let food = null;
        if (foodId && mongoose.Types.ObjectId.isValid(foodId)) {
          food = await Food.findById(foodId);
        }
        if (!food && item.name) {
          food = await Food.findOne({ name: new RegExp(`^${item.name}$`, 'i') });
        }

        let itemPrice = food ? food.price : (item.price || 100);
        const name = food ? food.name : (item.name || 'Dish');
        if (food && !restaurantId) restaurantId = food.restaurant;
        if (item.restaurant && !restaurantId && mongoose.Types.ObjectId.isValid(item.restaurant)) {
          restaurantId = item.restaurant;
        }

        if (item.selectedVariant) {
          itemPrice = item.selectedVariant.price;
        }
        if (item.selectedAddons && item.selectedAddons.length > 0) {
          itemPrice += item.selectedAddons.reduce((sum, a) => sum + a.price, 0);
        }

        orderItems.push({
          food: food ? food._id : (mongoose.Types.ObjectId.isValid(foodId) ? foodId : null),
          name,
          price: itemPrice,
          quantity: item.quantity || 1,
          addons: item.selectedAddons || [],
          variant: item.selectedVariant || null,
        });
        subtotal += itemPrice * (item.quantity || 1);
      }
    } else {
      // Checkout from DB cart
      const cart = await Cart.findOne({ user: req.user.id });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      for (const item of cart.items) {
        const food = await Food.findById(item.food);
        if (!food) continue;
        if (!restaurantId) restaurantId = food.restaurant;
        let itemPrice = food.price;
        if (item.selectedVariant) {
          itemPrice = item.selectedVariant.price;
        }
        if (item.selectedAddons && item.selectedAddons.length > 0) {
          itemPrice += item.selectedAddons.reduce((sum, a) => sum + a.price, 0);
        }

        orderItems.push({
          food: food._id,
          name: food.name,
          price: itemPrice,
          quantity: item.quantity,
          addons: item.selectedAddons || [],
          variant: item.selectedVariant || null,
        });
        subtotal += itemPrice * item.quantity;
      }

      // Clear the user's DB cart
      cart.items = [];
      cart.subtotal = 0;
      cart.tax = 0;
      cart.deliveryFee = 0;
      cart.discount = 0;
      cart.total = 0;
      cart.coupon = undefined;
      await cart.save();
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'No valid items in order' });
    }

    if (!restaurantId) {
      const defaultRest = await Restaurant.findOne();
      restaurantId = defaultRest ? defaultRest._id : null;
    }

    const tax = Number((subtotal * 0.05).toFixed(2));
    const deliveryFee = subtotal > 499 ? 0 : 40;
    const finalTotal = directTotal !== undefined ? directTotal : (subtotal + tax + deliveryFee);

    const orderData = {
      customer: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      address: address || 'Default Delivery Address, Sector 62',
      deliveryPartner: null,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'placed',
      subtotal,
      tax,
      deliveryFee,
      discount: 0,
      total: Number(finalTotal.toFixed(2)),
      razorpayOrderId: null,
    };

    if (['razorpay', 'upi', 'card', 'wallet'].includes(paymentMethod)) {
      const razorpayOrder = await razorpayInstance.orders.create({
        amount: Math.round(finalTotal * 100),
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
      });
      orderData.razorpayOrderId = razorpayOrder.id;
    }

    const order = await Order.create(orderData);
    const populated = await Order.findById(order._id)
      .populate('restaurant', 'name address phone image')
      .populate('customer', 'name email phone');

    // Emit real-time event via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('orderCreated', { orderId: order._id, status: order.orderStatus });
      io.to(order._id.toString()).emit('orderStatusUpdate', { orderId: order._id, status: order.orderStatus });
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

// @desc Get single order by ID
// @route GET /api/orders/:id
// @access Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name address phone image')
      .populate('customer', 'name email phone')
      .populate('deliveryPartner');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('getOrderById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get current user's orders
// @route GET /api/orders/my
// @access Private (customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('restaurant', 'name address image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('getMyOrders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update order status
// @route PATCH /api/orders/:id/status
// @access Private
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.orderStatus = status;
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdated', { orderId: order._id, status });
      io.to(order._id.toString()).emit('orderStatusUpdate', { orderId: order._id, status });
    }

    const updated = await Order.findById(order._id)
      .populate('restaurant', 'name address phone image')
      .populate('customer', 'name email phone');

    res.json(updated);
  } catch (err) {
    console.error('updateStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Advance order status helper (for live testing)
// @route POST /api/orders/:id/advance
// @access Private
exports.advanceStatus = async (req, res) => {
  const statusFlow = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'out_for_delivery', 'delivered'];
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const currentIndex = statusFlow.indexOf(order.orderStatus);
    const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : 'delivered';

    order.orderStatus = nextStatus;
    if (nextStatus === 'delivered') order.paymentStatus = 'paid';
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdated', { orderId: order._id, status: nextStatus });
      io.to(order._id.toString()).emit('orderStatusUpdate', { orderId: order._id, status: nextStatus });
    }

    const updated = await Order.findById(order._id)
      .populate('restaurant', 'name address phone image')
      .populate('customer', 'name email phone');

    res.json(updated);
  } catch (err) {
    console.error('advanceStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get orders for owner, delivery partner, or admin
// @route GET /api/orders
// @access Private
exports.getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'owner') {
      const restaurants = await Restaurant.find({ owner: req.user.id }).select('_id');
      query.restaurant = { $in: restaurants.map((r) => r._id) };
    } else if (req.user.role === 'delivery') {
      // delivery partner sees assigned or ready/out_for_delivery orders
      query.$or = [{ deliveryPartner: req.user.id }, { orderStatus: { $in: ['ready', 'picked_up', 'out_for_delivery'] } }];
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name address')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('getOrders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Assign delivery partner
// @route PATCH /api/orders/:id/assign
// @access Private
exports.assignDeliveryPartner = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const DeliveryPartner = require('../models/DeliveryPartner');
    let partner = await DeliveryPartner.findOne({ isOnline: true });
    if (!partner) {
      partner = await DeliveryPartner.findOne();
    }

    if (partner) {
      order.deliveryPartner = partner._id;
      order.orderStatus = 'out_for_delivery';
      await order.save();

      const io = req.app.get('io');
      if (io) {
        io.emit('orderAssigned', { orderId: order._id, partnerId: partner._id });
        io.to(order._id.toString()).emit('orderStatusUpdate', { orderId: order._id, status: 'out_for_delivery' });
      }
    }

    res.json(order);
  } catch (err) {
    console.error('assignDeliveryPartner error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
