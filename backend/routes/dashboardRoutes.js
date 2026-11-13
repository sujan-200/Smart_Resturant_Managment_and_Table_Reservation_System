const express = require('express');
const { getOverview } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', protect, authorize('admin', 'customer', 'waiter', 'kitchen'), getOverview);

module.exports = router;
