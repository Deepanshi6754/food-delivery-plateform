// server/controllers/deliveryPartnerController.js
const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const mongoose = require('mongoose');

/**
 * Toggle online/offline status for the authenticated delivery partner.
 */
exports.toggleOnline = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user.id });
    if (!partner) return res.status(404).json({ message: 'Delivery partner not found' });
    partner.isOnline = !partner.isOnline;
    await partner.save();
    res.json({ isOnline: partner.isOnline });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get list of currently online delivery partners (for admin/owner view).
 */
exports.getOnlinePartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find({ isOnline: true }).populate('user', 'name email');
    res.json(partners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update partner's location (latitude/longitude). Expects { lat, lng } in body.
 */
exports.updateLocation = async (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ message: 'Invalid coordinates' });
  }
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user.id });
    if (!partner) return res.status(404).json({ message: 'Delivery partner not found' });
    partner.location = { type: 'Point', coordinates: [lng, lat] };
    await partner.save();
    // emit location update (optional)
    if (req.app.get('io')) {
      req.app.get('io').emit('partnerLocation', { partnerId: partner._id, lat, lng });
    }
    res.json({ lat, lng });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delivery partner accepts an assigned order and updates status to 'picked_up'.
 */
exports.acceptOrder = async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID' });
  }
  try {
    const partner = await DeliveryPartner.findOne({ user: req.user.id });
    if (!partner) return res.status(404).json({ message: 'Delivery partner not found' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Ensure this partner is assigned to the order
    if (!order.deliveryPartner || order.deliveryPartner.toString() !== partner._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this order' });
    }
    order.orderStatus = 'picked_up';
    await order.save();
    // Emit status change
    if (req.app.get('io')) {
      req.app.get('io').emit('orderStatusUpdated', { orderId: order._id, status: order.orderStatus });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
