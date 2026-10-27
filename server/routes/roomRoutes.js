const express = require('express');
const { body } = require('express-validator');
const {
  getRooms,
  getAvailableRooms,
  getRoomById,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/', getRooms);
router.get('/available', getAvailableRooms);
router.get('/:id', getRoomById);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('roomNumber').trim().notEmpty().withMessage('Room number is required'),
    body('roomType').notEmpty().withMessage('Room type is required'),
    body('floor').isInt().withMessage('Floor must be an integer'),
    validate,
  ],
  createRoom
);

router.put('/:id', protect, authorize('admin'), updateRoom);
router.patch('/:id/status', protect, authorize('staff', 'admin'), updateRoomStatus);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

module.exports = router;
