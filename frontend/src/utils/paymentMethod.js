/**
 * Payment method configuration and formatting utilities.
 */

export const PAYMENT_METHODS = [
  { value: 'GPAY_UPI', label: 'GPay / UPI' },
  { value: 'CASH', label: 'Cash' },
];

/**
 * Format a payment method code (GPAY_UPI, CASH) into a user-friendly label.
 * Returns "Not specified" for legacy / null / undefined values.
 *
 * @param {string} method
 * @returns {string}
 */
export function formatPaymentMethod(method) {
  if (method === 'GPAY_UPI') return 'GPay / UPI';
  if (method === 'CASH') return 'Cash';
  return 'Not specified';
}

/**
 * Check if a payment method code is valid for new/updated transactions.
 *
 * @param {string} method
 * @returns {boolean}
 */
export function isValidPaymentMethod(method) {
  return method === 'GPAY_UPI' || method === 'CASH';
}
