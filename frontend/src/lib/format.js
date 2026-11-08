export const CURRENCY = 'INR';

const moneyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 2,
});

/**
 * Format a number into currency string (e.g. ₹1,500)
 * @param {number|string|null|undefined} value
 * @returns {string}
 */
export function formatMoney(value) {
  if (value == null || value === '' || isNaN(Number(value))) {
    return '₹0';
  }
  return moneyFormatter.format(Number(value));
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

/**
 * Format date string/object to readable date
 * @param {string|Date|null|undefined} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '—';
    return dateFormatter.format(d);
  } catch {
    return '—';
  }
}

/**
 * Format date-time string/object to readable date and time
 * @param {string|Date|null|undefined} dateInput
 * @returns {string}
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '—';
    return dateTimeFormatter.format(d);
  } catch {
    return '—';
  }
}

/**
 * Convert HTML input datetime-local (e.g. "2026-10-15T10:00") to backend LocalDateTime ("2026-10-15T10:00:00")
 * @param {string} localDateTimeStr
 * @returns {string}
 */
export function toBackendDateTime(localDateTimeStr) {
  if (!localDateTimeStr) return '';
  if (localDateTimeStr.length === 16) {
    return `${localDateTimeStr}:00`;
  }
  return localDateTimeStr;
}

/**
 * Get dashboard route for a specific user role
 * @param {string} role
 * @returns {string}
 */
export function dashboardPathFor(role) {
  switch (role) {
    case 'PROVIDER':
      return '/dashboard/provider';
    case 'WORKER':
      return '/dashboard/worker';
    case 'ADMIN':
      return '/dashboard/admin';
    default:
      return '/';
  }
}

