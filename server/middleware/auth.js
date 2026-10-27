const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'hotelpro_secret_fallback_key'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'User no longer exists');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated. Contact admin.');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth protect error:', error.message);
    return sendError(res, 401, 'Not authorized, token failed or expired');
  }
};

module.exports = { protect };
