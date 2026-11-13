const express = require('express');
const { getOrders, createOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin', 'waiter', 'kitchen', 'customer'), getOrders);
router.post('/', protect, createOrder);
router.patch('/:id/status', protect, authorize('admin', 'waiter', 'kitchen'), updateOrderStatus);

module.exports = router;
