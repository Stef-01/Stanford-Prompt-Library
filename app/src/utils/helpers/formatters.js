/**
 * Formatting Utilities
 * Common formatting functions for dates, text, numbers, etc.
 */

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
export function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength, suffix = '...') {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now - dateObj
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
  if (diffWeek < 4) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`
  if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`
  return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`
}

/**
 * Format date as human-readable string
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date
 */
export function formatDate(date, options = {}) {
  const {
    includeTime = false,
    format = 'long'  // short, long, full
  } = options

  const dateObj = typeof date === 'string' ? new Date(date) : date

  const formatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  }

  const timeOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }

  const dateStr = dateObj.toLocaleDateString('en-US', formatOptions[format])

  if (includeTime) {
    const timeStr = dateObj.toLocaleTimeString('en-US', timeOptions)
    return `${dateStr} at ${timeStr}`
  }

  return dateStr
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num == null) return '0'
  return num.toLocaleString('en-US')
}

/**
 * Format number as compact string (e.g., 1.2K, 3.4M)
 * @param {number} num - Number to format
 * @returns {string} Compact number string
 */
export function formatCompactNumber(num) {
  if (num == null) return '0'

  if (num < 1000) return num.toString()
  if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  if (num < 1000000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials
 * @returns {string} Initials
 */
export function getInitials(name, maxInitials = 2) {
  if (!name) return '?'

  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, maxInitials)
}

/**
 * Convert string to slug (URL-friendly)
 * @param {string} text - Text to slugify
 * @returns {string} Slug
 */
export function slugify(text) {
  if (!text) return ''

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export function capitalize(text) {
  if (!text) return ''

  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format percentage
 * @param {number} value - Value (0-1 or 0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 0) {
  const percentage = value > 1 ? value : value * 100
  return percentage.toFixed(decimals) + '%'
}

/**
 * Sanitize filename
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9.-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

/**
 * Parse query string to object
 * @param {string} queryString - Query string (with or without ?)
 * @returns {Object} Parsed query parameters
 */
export function parseQueryString(queryString) {
  const params = {}
  const query = queryString.startsWith('?') ? queryString.slice(1) : queryString

  query.split('&').forEach(param => {
    const [key, value] = param.split('=')
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    }
  })

  return params
}

/**
 * Object to query string
 * @param {Object} params - Parameters object
 * @returns {string} Query string
 */
export function toQueryString(params) {
  return Object.entries(params)
    .filter(([, value]) => value != null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

export default {
  escapeHtml,
  truncate,
  formatRelativeTime,
  formatDate,
  formatNumber,
  formatCompactNumber,
  getInitials,
  slugify,
  capitalize,
  formatFileSize,
  formatPercentage,
  sanitizeFilename,
  parseQueryString,
  toQueryString
}
