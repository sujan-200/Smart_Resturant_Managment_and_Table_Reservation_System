const express = require('express');
const { getTables, createTable, updateTableStatus } = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getTables);
router.post('/', protect, authorize('admin', 'waiter'), createTable);
router.patch('/:id/status', protect, authorize('admin', 'waiter'), updateTableStatus);

module.exports = router;
