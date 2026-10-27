/**
 * Standard API Response utilities compliant with HotelPro PRD Section 13.1
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, statusCode = 400, message = 'An error occurred', errors = null) => {
  const payload = {
    success: false,
    message,
  };
  if (errors && errors.length > 0) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};
