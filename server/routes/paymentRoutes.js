const express = require('express');
const { body } = require('express-validator');
const {
  createPayment,
  getBookingPayments,
  refundPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Valid payment amount is required'),
    body('method').isIn(['Cash', 'Card', 'UPI', 'Online']).withMessage('Valid method required'),
    validate,
  ],
  createPayment
);

router.get('/booking/:bookingId', getBookingPayments);
router.post('/:id/refund', authorize('staff', 'admin'), refundPayment);

module.exports = router;
