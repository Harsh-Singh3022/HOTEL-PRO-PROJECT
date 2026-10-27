const Task = require('../models/Task');
const Room = require('../models/Room');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Create task
// @route   POST /api/v1/tasks
// @access  Admin / Staff (Manager)
const createTask = async (req, res, next) => {
  try {
    const { title, description, room, assignedTo, priority, dueDate } = req.body;

    if (!title || !assignedTo) {
      return sendError(res, 400, 'Title and assignedTo are required');
    }

    const task = await Task.create({
      title,
      description: description || '',
      room: room || null,
      assignedTo,
      assignedBy: req.user._id,
      priority: priority || 'Medium',
      dueDate: dueDate || null,
    });

    const populated = await Task.findById(task._id)
      .populate('room')
      .populate('assignedTo', 'name email designation')
      .populate('assignedBy', 'name email');

    return sendSuccess(res, 201, 'Task created successfully', { task: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks
// @route   GET /api/v1/tasks
// @access  Staff / Admin
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, room, myTasks } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (room) query.room = room;

    // If staff requests their own tasks or myTasks=true
    if (myTasks === 'true' || (req.user.role === 'staff' && myTasks !== 'false')) {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('room')
      .populate('assignedTo', 'name email designation')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Tasks retrieved successfully', { tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status
// @route   PATCH /api/v1/tasks/:id/status
// @access  Assignee / Admin / Staff
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'InProgress', 'Done'];

    if (!allowed.includes(status)) {
      return sendError(res, 400, `Status must be one of: ${allowed.join(', ')}`);
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    task.status = status;
    await task.save();

    // FR-STAFF-4: If task is marked Done and associated with a room in 'Cleaning', update room to 'Available'
    if (status === 'Done' && task.room) {
      const room = await Room.findById(task.room);
      if (room && room.status === 'Cleaning') {
        room.status = 'Available';
        await room.save();
      }
    }

    const populated = await Task.findById(task._id)
      .populate('room')
      .populate('assignedTo', 'name email designation')
      .populate('assignedBy', 'name email');

    return sendSuccess(res, 200, `Task status updated to ${status}`, { task: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
};
