const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all users with optional role filter & pagination
// @route   GET /api/v1/users
// @access  Admin
const getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return sendSuccess(res, 200, 'Users retrieved successfully', {
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create staff account
// @route   POST /api/v1/users/staff
// @access  Admin
const createStaff = async (req, res, next) => {
  try {
    const { name, email, phone, password, designation, role = 'staff' } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return sendError(res, 409, 'User with this email already exists');
    }

    const staff = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      password: password || 'Staff@123',
      role,
      designation: designation || 'Receptionist',
      isActive: true,
    });

    const userObj = staff.toObject();
    delete userObj.password;

    return sendSuccess(res, 201, 'Staff member created successfully', { user: userObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details or active status
// @route   PUT /api/v1/users/:id
// @access  Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, phone, role, designation, isActive, address } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (designation !== undefined) user.designation = designation;
    if (isActive !== undefined) user.isActive = isActive;
    if (address) user.address = { ...user.address, ...address };

    await user.save();

    return sendSuccess(res, 200, 'User updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot delete your own admin account');
    }

    await User.findByIdAndDelete(req.params.id);

    return sendSuccess(res, 200, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createStaff,
  updateUser,
  deleteUser,
};
