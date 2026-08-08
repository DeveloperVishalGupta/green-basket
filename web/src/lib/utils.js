/**
 * Utility functions for the Green Basket application
 */

/**
 * Format price with currency symbol
 * @param {number} price - Price to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted price string
 * 
 * @example
 * formatPrice(99.99) // Returns: "$99.99"
 * formatPrice(1234.56, 'EUR') // Returns: "€1,234.56"
 */
export function formatPrice(price, currency = 'USD') {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    PKR: 'Rs.',
  };
  
  return `${symbols[currency] || '$'}${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate(new Date()) // Returns: "Nov 25, 2025"
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Generate slug from string
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 * 
 * @example
 * slugify('Red Cotton T-Shirt') // Returns: "red-cotton-t-shirt"
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 100)
 * @returns {string} Truncated text with ellipsis
 * 
 * @example
 * truncateText('Long description...', 20) // Returns: "Long description..."
 */
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} salePrice - Sale price
 * @returns {number} Discount percentage
 * 
 * @example
 * calculateDiscount(100, 75) // Returns: 25
 */
export function calculateDiscount(originalPrice, salePrice) {
  if (!originalPrice || originalPrice === salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Combine CSS classes conditionally
 * @param {...string} classes - Class names
 * @returns {string} Combined class string
 * 
 * @example
 * cn('base-class', isActive && 'active-class', 'another-class')
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
