/**
 * Generate human-readable booking reference e.g. HP-20261025-ABCD
 */
const generateBookingRef = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HP-${year}${month}${day}-${randomChars}`;
};

module.exports = generateBookingRef;
