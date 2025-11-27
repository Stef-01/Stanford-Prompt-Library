/**
 * Validation Utilities
 * Common validation functions for forms and data
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @param {Object} options - Validation options
 * @returns {boolean} Is valid URL
 */
export function isValidUrl(url, options = {}) {
  const { requireProtocol = true, allowedProtocols = ['http', 'https'] } = options

  if (!url) return false

  try {
    const urlObj = new URL(url)

    if (requireProtocol && !allowedProtocols.includes(urlObj.protocol.replace(':', ''))) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateLength(str, min, max) {
  if (!str) {
    return { valid: false, error: 'Value is required' }
  }

  if (str.length < min) {
    return { valid: false, error: `Must be at least ${min} characters` }
  }

  if (max && str.length > max) {
    return { valid: false, error: `Must be less than ${max} characters` }
  }

  return { valid: true, error: null }
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateRequired(value, fieldName = 'This field') {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return { valid: false, error: `${fieldName} is required` }
  }

  return { valid: true, error: null }
}

/**
 * Validate number range
 * @param {number} num - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validateRange(num, min, max) {
  if (num == null || isNaN(num)) {
    return { valid: false, error: 'Must be a valid number' }
  }

  if (min != null && num < min) {
    return { valid: false, error: `Must be at least ${min}` }
  }

  if (max != null && num > max) {
    return { valid: false, error: `Must be at most ${max}` }
  }

  return { valid: true, error: null }
}

/**
 * Validate pattern (regex)
 * @param {string} str - String to validate
 * @param {RegExp} pattern - Regex pattern
 * @param {string} errorMessage - Error message
 * @returns {{valid: boolean, error: string|null}} Validation result
 */
export function validatePattern(str, pattern, errorMessage = 'Invalid format') {
  if (!str) {
    return { valid: false, error: 'Value is required' }
  }

  if (!pattern.test(str)) {
    return { valid: false, error: errorMessage }
  }

  return { valid: true, error: null }
}

/**
 * Validate form data against schema
 * @param {Object} data - Form data
 * @param {Object} schema - Validation schema
 * @returns {{valid: boolean, errors: Object}} Validation result
 */
export function validateForm(data, schema) {
  const errors = {}

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]

    // Required
    if (rules.required) {
      const result = validateRequired(value, rules.label || field)
      if (!result.valid) {
        errors[field] = result.error
        continue
      }
    }

    // Skip other validations if value is empty and not required
    if (!rules.required && !value) {
      continue
    }

    // Email
    if (rules.type === 'email' && !isValidEmail(value)) {
      errors[field] = 'Invalid email address'
      continue
    }

    // URL
    if (rules.type === 'url' && !isValidUrl(value)) {
      errors[field] = 'Invalid URL'
      continue
    }

    // Length
    if (rules.minLength || rules.maxLength) {
      const result = validateLength(value, rules.minLength, rules.maxLength)
      if (!result.valid) {
        errors[field] = result.error
        continue
      }
    }

    // Range (for numbers)
    if (rules.type === 'number' && (rules.min != null || rules.max != null)) {
      const result = validateRange(Number(value), rules.min, rules.max)
      if (!result.valid) {
        errors[field] = result.error
        continue
      }
    }

    // Pattern
    if (rules.pattern) {
      const result = validatePattern(value, rules.pattern, rules.patternError)
      if (!result.valid) {
        errors[field] = result.error
        continue
      }
    }

    // Custom validator
    if (rules.validator && typeof rules.validator === 'function') {
      const result = rules.validator(value, data)
      if (!result.valid) {
        errors[field] = result.error
        continue
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  email: {
    email: {
      required: true,
      type: 'email',
      label: 'Email'
    }
  },

  password: {
    password: {
      required: true,
      minLength: 8,
      label: 'Password',
      validator: (value) => {
        if (!/[A-Z]/.test(value)) {
          return { valid: false, error: 'Must contain at least one uppercase letter' }
        }
        if (!/[a-z]/.test(value)) {
          return { valid: false, error: 'Must contain at least one lowercase letter' }
        }
        if (!/[0-9]/.test(value)) {
          return { valid: false, error: 'Must contain at least one number' }
        }
        return { valid: true }
      }
    }
  },

  prompt: {
    title: {
      required: true,
      minLength: 5,
      maxLength: 100,
      label: 'Title'
    },
    description: {
      required: true,
      minLength: 20,
      maxLength: 500,
      label: 'Description'
    },
    prompt_text: {
      required: true,
      minLength: 50,
      maxLength: 5000,
      label: 'Prompt content'
    },
    category: {
      required: true,
      label: 'Category'
    }
  },

  tool: {
    name: {
      required: true,
      minLength: 3,
      maxLength: 50,
      label: 'Tool name'
    },
    description: {
      required: true,
      minLength: 20,
      maxLength: 200,
      label: 'Description'
    },
    url: {
      required: true,
      type: 'url',
      label: 'Website URL'
    },
    category: {
      required: true,
      label: 'Category'
    }
  }
}

export default {
  isValidEmail,
  isValidUrl,
  validateLength,
  validateRequired,
  validateRange,
  validatePattern,
  validateForm,
  commonSchemas
}
