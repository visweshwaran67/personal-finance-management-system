/**
 * Date formatting and manipulation utilities.
 */

/**
 * Format a YYYY-MM-DD or ISO string into a human-readable date (e.g. 17 Oct 2026).
 *
 * @param {string} dateString
 * @returns {string}
 */
export function formatDisplayDate(dateString) {
  if (!dateString) return '—';

  try {
    // Parse parts directly to avoid timezone shift on YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Get today's date formatted as YYYY-MM-DD for standard HTML date inputs.
 *
 * @returns {string}
 */
export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current date for the top navigation greeting (e.g., Saturday, 17 October 2026).
 *
 * @returns {string}
 */
export function getCurrentDateFormatted() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Compare two expense items to sort them by date descending (latest first).
 */
export function compareExpensesByDateDesc(a, b) {
  const dateA = a.date ? new Date(a.date).getTime() : 0;
  const dateB = b.date ? new Date(b.date).getTime() : 0;
  if (dateB !== dateA) {
    return dateB - dateA;
  }
  return (b.id || 0) - (a.id || 0);
}

/**
 * Check if a date string (YYYY-MM-DD) matches today's local date.
 *
 * @param {string} dateString
 * @returns {boolean}
 */
export function isToday(dateString) {
  if (!dateString) return false;
  return dateString === getTodayString();
}

/**
 * Format date with contextual prefix (e.g. "Today, 22 Oct 2026" or "18 Oct 2026").
 *
 * @param {string} dateString
 * @returns {string}
 */
export function formatDateWithContext(dateString) {
  if (!dateString) return '—';
  const formatted = formatDisplayDate(dateString);
  if (isToday(dateString)) {
    return `Today, ${formatted}`;
  }
  return formatted;
}

/**
 * Get current year and month as YYYY-MM (e.g. "2026-10").
 *
 * @returns {string}
 */
export function getCurrentYearMonth() {
  return getTodayString().substring(0, 7);
}

/**
 * Get full month name and year (e.g. "October 2026").
 *
 * @returns {string}
 */
export function getCurrentMonthName() {
  return new Date().toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Check if a date string falls within the current local calendar month and year.
 *
 * @param {string} dateString
 * @returns {boolean}
 */
export function isCurrentMonth(dateString) {
  if (!dateString) return false;
  return dateString.startsWith(getCurrentYearMonth());
}
