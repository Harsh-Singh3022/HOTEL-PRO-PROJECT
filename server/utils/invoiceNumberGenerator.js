/**
 * Generate human-readable invoice reference e.g. INV-20261025-ABCD
 */
const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${year}${month}${day}-${randomChars}`;
};

module.exports = generateInvoiceNumber;
