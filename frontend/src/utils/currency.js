/**
 * Utility functions for Indian currency (INR) formatting.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format numeric value or numeric string to INR format (e.g., ₹1,250.00).
 * Handles null, undefined, invalid numbers gracefully.
 *
 * @param {number|string} amount
 * @returns {string} Formatted Indian currency string
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0.00';
  }
  return inrFormatter.format(Number(amount));
}
