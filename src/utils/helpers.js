/**
 * Utilities and helper functions
 */

/**
 * Format a date string to a human-readable format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Get file icon based on file extension
 * @param {string} filePath - File path
 * @returns {string} - Icon character/emoji
 */
export const getFileIcon = (filePath) => {
  if (!filePath) return '📄';
  
  const ext = filePath.split('.').pop().toLowerCase();
  
  const icons = {
    js: '📄',
    jsx: '⚛️',
    ts: '📄',
    tsx: '⚛️',
    html: '🌐',
    css: '🎨',
    json: '🔧',
    md: '📝',
    py: '🐍',
    java: '☕',
    go: '🐹',
    php: '🐘',
    rb: '💎',
    rs: '🦀',
    txt: '📝',
    gitignore: '🔍',
    env: '🔒',
    default: '📄'
  };
  
  return icons[ext] || icons.default;
};

/**
 * Get file language for Monaco editor
 * @param {string} filePath - File path
 * @returns {string} - Monaco editor language
 */
export const getFileLanguage = (filePath) => {
  if (!filePath) return 'plaintext';
  
  const ext = filePath.split('.').pop().toLowerCase();
  
  const languages = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    py: 'python',
    java: 'java',
    go: 'go',
    php: 'php',
    rb: 'ruby',
    rs: 'rust',
    txt: 'plaintext',
    gitignore: 'plaintext',
    env: 'plaintext',
    default: 'plaintext'
  };
  
  return languages[ext] || languages.default;
};

/**
 * Truncate a string to a maximum length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated string
 */
export const truncate = (str, maxLength = 30) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounce a function
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};