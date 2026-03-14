/**
 * Utility functions for the AI House backend
 */

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Output format (iso, display, short)
 * @returns {string} Formatted date string
 */
const formatDate = (date, format = 'display') => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return null;
  }

  switch (format) {
    case 'iso':
      return d.toISOString();
    case 'display':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'short':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    case 'time':
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return d.toISOString();
  }
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Raw input string
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '')
    .trim();
};

/**
 * Generate a slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Paginate array results
 * @param {Array} data - Array to paginate
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result with metadata
 */
const paginate = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: data.slice(startIndex, endIndex),
    pagination: {
      total: data.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(data.length / limit),
      hasNextPage: endIndex < data.length,
      hasPrevPage: startIndex > 0
    }
  };
};

/**
 * Check if an email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate a random token
 * @param {number} length - Token length
 * @returns {string} Random token
 */
const generateToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Convert camelCase to snake_case
 * @param {string} str - Camel case string
 * @returns {string} Snake case string
 */
const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Convert snake_case to camelCase
 * @param {string} str - Snake case string
 * @returns {string} Camel case string
 */
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Filter object keys
 * @param {Object} obj - Source object
 * @param {Array} allowedKeys - Keys to keep
 * @returns {Object} Filtered object
 */
const filterObject = (obj, allowedKeys) => {
  return Object.keys(obj)
    .filter(key => allowedKeys.includes(key))
    .reduce((filtered, key) => {
      filtered[key] = obj[key];
      return filtered;
    }, {});
};

/**
 * Calculate event status based on dates
 * @param {Date} startDate - Event start date
 * @param {Date} endDate - Event end date
 * @returns {string} Event status
 */
const calculateEventStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (now < start) {
    return 'upcoming';
  } else if (end && now > end) {
    return 'completed';
  } else {
    return 'ongoing';
  }
};

/**
 * Format API response
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {*} data - Response data
 * @returns {Object} Formatted response
 */
const apiResponse = (success, message, data = null) => {
  const response = { success, message };
  if (data !== null) {
    response.data = data;
  }
  return response;
};

module.exports = {
  formatDate,
  sanitizeInput,
  generateSlug,
  paginate,
  isValidEmail,
  generateToken,
  camelToSnake,
  snakeToCamel,
  deepClone,
  filterObject,
  calculateEventStatus,
  apiResponse
};
