const Order  = require('../models/Order');
const Product = require('../models/Product');

// @desc  Place new order
// @route POST /api/orders
// @access Private
const placeOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  // Verify stock and build enriched items
  const enrichedItems = [];
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: `Product not found: ${item.product}` });
    }
    if (product.stock < item.qty) {
      return res.status(400).json({
        message: `Insufficient stock for "${product.name}" (available: ${product.stock})`,
      });
    }
    enrichedItems.push({
      product: product._id,
      name:    product.name,
      image:   product.image,
      price:   product.price,
      qty:     item.qty,
    });
    // Decrement stock
    product.stock -= item.qty;
    await product.save();
  }

  try {
    const order = await Order.create({
      user: req.user._id,
      items: enrichedItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Card',
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Get my orders
// @route GET /api/orders/mine
// @access Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name image');
  res.json(orders);
};

// @desc  Get all orders (admin)
// @route GET /api/orders
// @access Admin
const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};

  const total  = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate('user', 'name email');

  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

// @desc  Get single order
// @route GET /api/orders/:id
// @access Private (own order or admin)
const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name image');

  if (!order) return res.status(404).json({ message: 'Order not found' });

  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  res.json(order);
};

// @desc  Update order status (admin)
// @route PUT /api/orders/:id
// @access Admin
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status;
  if (status === 'Delivered') {
    order.deliveredAt = Date.now();
    order.isPaid      = true;
    order.paidAt      = order.paidAt || Date.now();
  }
  await order.save();
  res.json(order);
};

// @desc  Cancel order (user, only if Processing)
// @route PUT /api/orders/:id/cancel
// @access Private
const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (order.status !== 'Processing') {
    return res.status(400).json({ message: 'Cannot cancel order at this stage' });
  }

  // Restock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
  }

  order.status = 'Cancelled';
  await order.save();
  res.json(order);
};

module.exports = { placeOrder, getMyOrders, getAllOrders, getOrder, updateOrderStatus, cancelOrder };
