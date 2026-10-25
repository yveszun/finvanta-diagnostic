/**
 * Formatting utilities for dashboard display
 */

export function formatNumber(num) {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString('en-US');
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'N/A';
  return `₱${amount.toLocaleString('en-US')}`;
}

export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

export function safePercent(numerator, denominator, decimals = 1) {
  if (!denominator || denominator === 0) return 'N/A';
  return formatPercent((numerator / denominator) * 100, decimals);
}
