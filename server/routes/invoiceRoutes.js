const express = require('express');
const {
  getInvoiceByBooking,
  generateInvoice,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.get('/booking/:bookingId', getInvoiceByBooking);
router.post('/booking/:bookingId', authorize('staff', 'admin'), generateInvoice);

module.exports = router;
