const express = require('express');
const router  = express.Router();
const {
  placeOrder, getMyOrders, getAllOrders,
  getOrder, updateOrderStatus, cancelOrder,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, placeOrder)
  .get(protect, adminOnly, getAllOrders);

router.get('/mine', protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrder)
  .put(protect, adminOnly, updateOrderStatus);

router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
