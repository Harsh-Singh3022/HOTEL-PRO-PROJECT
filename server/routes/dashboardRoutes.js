const express = require('express');
const {
  getSummaryStats,
  getOccupancyReport,
  getRevenueReport,
  getBookingTrendsReport,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.get('/dashboard/summary', authorize('staff', 'admin'), getSummaryStats);
router.get('/reports/occupancy', authorize('admin'), getOccupancyReport);
router.get('/reports/revenue', authorize('admin'), getRevenueReport);
router.get('/reports/bookings', authorize('admin'), getBookingTrendsReport);

module.exports = router;
