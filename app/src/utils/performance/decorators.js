/**
 * Performance Monitoring Decorators
 * Decorators and HOCs for automatic performance tracking
 */

import { performanceMonitor } from './monitor.js'

/**
 * Measure execution time of a function
 * @param {string} label - Measurement label
 * @returns {Function} Decorator function
 */
export function measurePerformance(label) {
  return function (target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args) {
      const finalLabel = label || `${target.constructor.name}.${propertyKey}`
      return performanceMonitor.measureAsync(finalLabel, () => originalMethod.apply(this, args))
    }

    return descriptor
  }
}

/**
 * Track component render performance
 * @param {string} componentName - Component name
 * @returns {Function} Wrapper function
 */
export function trackRender(componentName) {
  return function (renderFn) {
    return function (...args) {
      const startTime = performance.now()
      const result = renderFn.apply(this, args)
      const duration = performance.now() - startTime

      performanceMonitor.trackComponentRender(componentName, duration, {
        argCount: args.length
      })

      return result
    }
  }
}

/**
 * Track async component render performance
 * @param {string} componentName - Component name
 * @returns {Function} Wrapper function
 */
export function trackAsyncRender(componentName) {
  return function (renderFn) {
    return async function (...args) {
      const startTime = performance.now()
      const result = await renderFn.apply(this, args)
      const duration = performance.now() - startTime

      performanceMonitor.trackComponentRender(componentName, duration, {
        argCount: args.length,
        async: true
      })

      return result
    }
  }
}

/**
 * Wrap a function with performance tracking
 * @param {Function} fn - Function to wrap
 * @param {string} label - Measurement label
 * @returns {Function} Wrapped function
 */
export function withPerformanceTracking(fn, label) {
  return function (...args) {
    performanceMonitor.start(label)
    try {
      const result = fn.apply(this, args)
      performanceMonitor.end(label, { success: true })
      return result
    } catch (error) {
      performanceMonitor.end(label, { success: false, error: error.message })
      throw error
    }
  }
}

/**
 * Wrap an async function with performance tracking
 * @param {Function} fn - Async function to wrap
 * @param {string} label - Measurement label
 * @returns {Function} Wrapped function
 */
export function withAsyncPerformanceTracking(fn, label) {
  return async function (...args) {
    performanceMonitor.start(label)
    try {
      const result = await fn.apply(this, args)
      performanceMonitor.end(label, { success: true })
      return result
    } catch (error) {
      performanceMonitor.end(label, { success: false, error: error.message })
      throw error
    }
  }
}

/**
 * Create a performance-tracked version of an object's methods
 * @param {Object} obj - Object to track
 * @param {string} prefix - Metric prefix
 * @returns {Object} Tracked object
 */
export function trackObject(obj, prefix = '') {
  const tracked = {}

  for (const key of Object.keys(obj)) {
    const value = obj[key]

    if (typeof value === 'function') {
      const label = prefix ? `${prefix}.${key}` : key

      tracked[key] = async function (...args) {
        return performanceMonitor.measureAsync(label, () => value.apply(obj, args))
      }
    } else {
      tracked[key] = value
    }
  }

  return tracked
}

/**
 * Debounce a function with performance tracking
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Debounce delay in ms
 * @param {string} label - Measurement label
 * @returns {Function} Debounced function
 */
export function debouncedWithTracking(fn, delay, label) {
  let timeoutId = null
  let callCount = 0

  return function (...args) {
    callCount++

    clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      performanceMonitor.start(label)
      try {
        fn.apply(this, args)
        performanceMonitor.end(label, { callCount })
      } catch (error) {
        performanceMonitor.end(label, { callCount, error: error.message })
      }
      callCount = 0
    }, delay)
  }
}

/**
 * Throttle a function with performance tracking
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Throttle limit in ms
 * @param {string} label - Measurement label
 * @returns {Function} Throttled function
 */
export function throttledWithTracking(fn, limit, label) {
  let inThrottle = false
  let callCount = 0

  return function (...args) {
    callCount++

    if (!inThrottle) {
      performanceMonitor.start(label)
      try {
        fn.apply(this, args)
        performanceMonitor.end(label, { callCount })
      } catch (error) {
        performanceMonitor.end(label, { callCount, error: error.message })
      }

      inThrottle = true
      callCount = 0

      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

export default {
  measurePerformance,
  trackRender,
  trackAsyncRender,
  withPerformanceTracking,
  withAsyncPerformanceTracking,
  trackObject,
  debouncedWithTracking,
  throttledWithTracking
}
