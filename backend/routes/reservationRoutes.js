const express = require('express');
const { getReservations, createReservation, updateReservation } = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin', 'waiter', 'customer'), getReservations);
router.post('/', protect, createReservation);
router.patch('/:id', protect, authorize('admin', 'waiter'), updateReservation);

module.exports = router;
