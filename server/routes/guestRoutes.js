const express = require('express');
const { body } = require('express-validator');
const {
  getGuests,
  createGuest,
  getGuestById,
  updateGuest,
} = require('../controllers/guestController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);
router.use(authorize('staff', 'admin'));

router.get('/', getGuests);
router.get('/:id', getGuestById);

router.post(
  '/',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    validate,
  ],
  createGuest
);

router.put('/:id', updateGuest);

module.exports = router;
