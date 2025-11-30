/**
 * Logger Utility
 * Provides environment-aware logging
 * - Development: All logs visible
 * - Production: Only errors visible
 */

const isDev = import.meta.env.DEV

/**
 * Logger with environment awareness
 */
export const logger = {
  /**
   * Debug log (development only)
   * @param {...any} args - Log arguments
   */
  debug: (...args) => {
    if (isDev) {
      console.log(...args)
    }
  },

  /**
   * Info log (development only)
   * @param {...any} args - Log arguments
   */
  info: (...args) => {
    if (isDev) {
      console.log(...args)
    }
  },

  /**
   * Warning log (development only)
   * @param {...any} args - Log arguments
   */
  warn: (...args) => {
    if (isDev) {
      console.warn(...args)
    }
  },

  /**
   * Error log (always visible)
   * @param {...any} args - Log arguments
   */
  error: (...args) => {
    console.error(...args)
  },

  /**
   * Conditional debug log
   * @param {boolean} condition - Log only if true
   * @param {...any} args - Log arguments
   */
  debugIf: (condition, ...args) => {
    if (isDev && condition) {
      console.log(...args)
    }
  }
}

/**
 * Create a logger with a prefix
 * @param {string} prefix - Prefix for all logs
 * @returns {Object} Scoped logger
 */
export function createLogger(prefix) {
  return {
    debug: (...args) => logger.debug(`[${prefix}]`, ...args),
    info: (...args) => logger.info(`[${prefix}]`, ...args),
    warn: (...args) => logger.warn(`[${prefix}]`, ...args),
    error: (...args) => logger.error(`[${prefix}]`, ...args),
    debugIf: (condition, ...args) => logger.debugIf(condition, `[${prefix}]`, ...args)
  }
}

export default logger
