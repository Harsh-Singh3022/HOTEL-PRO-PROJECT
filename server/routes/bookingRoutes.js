const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  modifyBooking,
  cancelBooking,
  checkInBooking,
  checkOutBooking,
  addExtraCharge,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('room').notEmpty().withMessage('Room ID is required'),
    body('checkInDate').isISO8601().withMessage('Valid check-in date is required'),
    body('checkOutDate').isISO8601().withMessage('Valid check-out date is required'),
    body('numGuests').isInt({ min: 1 }).withMessage('At least 1 guest required'),
    validate,
  ],
  createBooking
);

router.get('/my', getMyBookings);
router.get('/', authorize('staff', 'admin'), getAllBookings);
router.get('/:id', getBookingById);
router.put('/:id', modifyBooking);
router.patch('/:id/cancel', cancelBooking);

router.patch('/:id/check-in', authorize('staff', 'admin'), checkInBooking);
router.patch('/:id/check-out', authorize('staff', 'admin'), checkOutBooking);
router.post(
  '/:id/charges',
  authorize('staff', 'admin'),
  [
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    validate,
  ],
  addExtraCharge
);

module.exports = router;
