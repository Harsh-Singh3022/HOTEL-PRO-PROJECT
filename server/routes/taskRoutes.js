const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getTasks,
  updateTaskStatus,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);
router.use(authorize('staff', 'admin'));

router.get('/', getTasks);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('assignedTo').notEmpty().withMessage('AssignedTo staff ID is required'),
    validate,
  ],
  createTask
);

router.patch('/:id/status', updateTaskStatus);

module.exports = router;
