const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  return (
    process.env.JWT_SECRET ||
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_REFRESH_SECRET ||
    'hotelpro_secret_fallback_key'
  );
};

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );
};

module.exports = generateToken;
