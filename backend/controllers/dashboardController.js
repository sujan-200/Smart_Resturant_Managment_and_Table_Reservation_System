const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Table = require('../models/Table');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const MenuItem = require('../models/MenuItem');

async function getOverview(req, res) {
  try {
    const [totalReservations, totalCustomers, availableTables, occupiedTables, totalOrders, menuCount] = await Promise.all([
      Reservation.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Table.countDocuments({ status: 'available' }),
      Table.countDocuments({ status: 'occupied' }),
      Order.countDocuments(),
      MenuItem.countDocuments(),
    ]);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const dailyRevenueResult = await Payment.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const salesTrend = await Payment.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) }, status: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const recentOrders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 }).limit(5);
    const recentReservations = await Reservation.find().populate('customer', 'name email').sort({ createdAt: -1 }).limit(5);

    res.json({
      stats: {
        totalReservations,
        totalCustomers,
        availableTables,
        occupiedTables,
        totalOrders,
        dailyRevenue: dailyRevenueResult[0]?.total || 0,
        menuCount,
      },
      salesTrend,
      recentOrders,
      recentReservations,
    });
  } catch (error) {
    res.status(500).json({ message: 'Dashboard overview failed.', error: error.message });
  }
}

module.exports = { getOverview };
