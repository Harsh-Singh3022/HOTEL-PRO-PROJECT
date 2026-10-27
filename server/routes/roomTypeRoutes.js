const express = require('express');
const { body } = require('express-validator');
const {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
} = require('../controllers/roomTypeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', getRoomTypes);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Room type name is required'),
    body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a non-negative number'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1 guest'),
    validate,
  ],
  createRoomType
);

router.put('/:id', protect, authorize('admin'), updateRoomType);
router.delete('/:id', protect, authorize('admin'), deleteRoomType);

module.exports = router;
