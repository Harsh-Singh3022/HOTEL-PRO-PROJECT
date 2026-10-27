const Booking = require('../models/Booking');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Payment = require('../models/Payment');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Today's KPI summary for dashboard
// @route   GET /api/v1/dashboard/summary
// @access  Staff / Admin
const getSummaryStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);

    // 1. Rooms breakdown
    const activeRooms = await Room.find({ isActive: true });
    const totalRooms = activeRooms.length;
    const availableRooms = activeRooms.filter((r) => r.status === 'Available').length;
    const occupiedRooms = activeRooms.filter((r) => r.status === 'Occupied').length;
    const cleaningRooms = activeRooms.filter((r) => r.status === 'Cleaning').length;
    const maintenanceRooms = activeRooms.filter((r) => r.status === 'Maintenance').length;

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 2. Today's Arrivals and Departures
    const todayCheckIns = await Booking.countDocuments({
      checkInDate: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['Confirmed', 'CheckedIn'] },
    });

    const todayCheckOuts = await Booking.countDocuments({
      checkOutDate: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['CheckedIn', 'CheckedOut'] },
    });

    // 3. Revenue calculations
    const todayPayments = await Payment.find({
      paidAt: { $gte: todayStart, $lte: todayEnd },
      status: 'Paid',
    });
    const todayRevenue = todayPayments.reduce((acc, p) => (p.type === 'Payment' ? acc + p.amount : acc - p.amount), 0);

    const weekPayments = await Payment.find({
      paidAt: { $gte: weekStart },
      status: 'Paid',
    });
    const weekRevenue = weekPayments.reduce((acc, p) => (p.type === 'Payment' ? acc + p.amount : acc - p.amount), 0);

    const monthPayments = await Payment.find({
      paidAt: { $gte: monthStart },
      status: 'Paid',
    });
    const monthRevenue = monthPayments.reduce((acc, p) => (p.type === 'Payment' ? acc + p.amount : acc - p.amount), 0);

    // 4. Recent bookings
    const recentBookings = await Booking.find()
      .populate({ path: 'room', populate: { path: 'roomType' } })
      .populate('guest')
      .sort({ createdAt: -1 })
      .limit(6);

    return sendSuccess(res, 200, 'Dashboard summary retrieved', {
      kpi: {
        totalRooms,
        availableRooms,
        occupiedRooms,
        cleaningRooms,
        maintenanceRooms,
        occupancyRate,
        todayCheckIns,
        todayCheckOuts,
        todayRevenue,
        weekRevenue,
        monthRevenue,
      },
      roomStatusBreakdown: {
        Available: availableRooms,
        Occupied: occupiedRooms,
        Cleaning: cleaningRooms,
        Maintenance: maintenanceRooms,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Occupancy report
// @route   GET /api/v1/reports/occupancy
// @access  Admin
const getOccupancyReport = async (req, res, next) => {
  try {
    const roomTypes = await RoomType.find();
    const rooms = await Room.find({ isActive: true });

    const report = roomTypes.map((type) => {
      const typeRooms = rooms.filter((r) => r.roomType.toString() === type._id.toString());
      const total = typeRooms.length;
      const occupied = typeRooms.filter((r) => r.status === 'Occupied').length;
      const available = typeRooms.filter((r) => r.status === 'Available').length;
      const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;

      return {
        roomTypeId: type._id,
        roomTypeName: type.name,
        basePrice: type.basePrice,
        totalRooms: total,
        occupied,
        available,
        occupancyPercentage: rate,
      };
    });

    return sendSuccess(res, 200, 'Occupancy report generated', { report });
  } catch (error) {
    next(error);
  }
};

// @desc    Revenue report with ADR and RevPAR
// @route   GET /api/v1/reports/revenue
// @access  Admin
const getRevenueReport = async (req, res, next) => {
  try {
    const totalActiveRooms = await Room.countDocuments({ isActive: true });

    // Group payments by date over last 14 days
    const days = 14;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const payments = await Payment.find({
      paidAt: { $gte: sinceDate },
      status: 'Paid',
    }).sort({ paidAt: 1 });

    const dailyMap = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { date: key, revenue: 0, count: 0 };
    }

    payments.forEach((p) => {
      const key = p.paidAt.toISOString().split('T')[0];
      if (dailyMap[key]) {
        if (p.type === 'Payment') {
          dailyMap[key].revenue += p.amount;
          dailyMap[key].count += 1;
        } else {
          dailyMap[key].revenue -= p.amount;
        }
      }
    });

    const dailyData = Object.values(dailyMap);
    const totalRev = dailyData.reduce((acc, d) => acc + d.revenue, 0);
    const totalRoomsSold = dailyData.reduce((acc, d) => acc + d.count, 0);

    const adr = totalRoomsSold > 0 ? Math.round(totalRev / totalRoomsSold) : 0;
    const revpar = (totalActiveRooms * days) > 0 ? Math.round(totalRev / (totalActiveRooms * days)) : 0;

    return sendSuccess(res, 200, 'Revenue report generated', {
      summary: {
        totalRevenue: Math.round(totalRev),
        roomsSold: totalRoomsSold,
        averageDailyRate: adr,
        revenuePerAvailableRoom: revpar,
        periodDays: days,
      },
      dailyData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Booking trends / CSV export
// @route   GET /api/v1/reports/bookings
// @access  Admin
const getBookingTrendsReport = async (req, res, next) => {
  try {
    const { format, status, startDate, endDate } = req.query;
    const query = {};

    if (status) query.status = status;
    if (startDate && endDate) {
      query.checkInDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bookings = await Booking.find(query)
      .populate({ path: 'room', populate: { path: 'roomType' } })
      .populate('guest')
      .populate('bookedBy', 'name email')
      .sort({ createdAt: -1 });

    // Handle CSV export (FR-DASH-5)
    if (format === 'csv') {
      const header = 'BookingRef,GuestName,Phone,RoomNumber,RoomType,CheckIn,CheckOut,Status,TotalAmount,PaymentStatus\n';
      const rows = bookings.map((b) => {
        const guestName = (b.guest?.fullName || 'N/A').replace(/,/g, ' ');
        const phone = b.guest?.phone || 'N/A';
        const roomNum = b.room?.roomNumber || 'N/A';
        const roomTypeName = (b.room?.roomType?.name || 'N/A').replace(/,/g, ' ');
        const checkIn = new Date(b.checkInDate).toISOString().split('T')[0];
        const checkOut = new Date(b.checkOutDate).toISOString().split('T')[0];
        return `${b.bookingRef},${guestName},${phone},${roomNum},${roomTypeName},${checkIn},${checkOut},${b.status},${b.totalAmount},${b.paymentStatus}`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="hotelpro-bookings-report.csv"');
      return res.status(200).send(header + rows);
    }

    return sendSuccess(res, 200, 'Booking report generated', {
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummaryStats,
  getOccupancyReport,
  getRevenueReport,
  getBookingTrendsReport,
};
