const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  createStaff,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);

router.post(
  '/staff',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('designation').trim().notEmpty().withMessage('Designation is required'),
    validate,
  ],
  createStaff
);

router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
