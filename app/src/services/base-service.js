/**
 * Base Service Class
 * Provides standardized error handling, caching, and real-time subscriptions
 * for all Supabase service operations
 */

import { supabase } from '../config/supabase.js'
import { CACHE_TTL } from '../config/constants.js'

// ============================================================================
// Custom Error Classes
// ============================================================================

export class DatabaseError extends Error {
  constructor(message, code, details = null) {
    super(message)
    this.name = 'DatabaseError'
    this.code = code
    this.details = details
  }
}

export class ServiceError extends Error {
  constructor(message, originalError = null) {
    super(message)
    this.name = 'ServiceError'
    this.originalError = originalError
  }
}

export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message)
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'You must be signed in to perform this action') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

// ============================================================================
// Base Service Class
// ============================================================================

export class BaseService {
  constructor(tableName, options = {}) {
    this.tableName = tableName
    this.cache = new Map()
    this.inflightRequests = new Map()
    this.subscriptions = new Map()

    // Configuration
    this.config = {
      cacheEnabled: options.cacheEnabled !== false,
      cacheTTL: options.cacheTTL || CACHE_TTL.MEDIUM,
      maxCacheSize: options.maxCacheSize || 100,
      dedupeRequests: options.dedupeRequests !== false,
      enableMetrics: options.enableMetrics !== false
    }

    // Metrics
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      requests: 0,
      errors: 0
    }
  }

  // ==========================================================================
  // Query Execution
  // ==========================================================================

  /**
   * Execute a Supabase query with standardized error handling
   * @param {Function} queryFn - Function that returns a Supabase query
   * @param {Object} options - Execution options
   * @returns {Promise<any>} Query result data
   */
  async executeQuery(queryFn, options = {}) {
    const startTime = Date.now()

    try {
      this.metrics.requests++

      const { data, error } = await queryFn()

      if (error) {
        this.metrics.errors++
        console.error(`[${this.tableName}] Database error:`, error)
        throw new DatabaseError(error.message, error.code, error.details)
      }

      if (this.config.enableMetrics) {
        const duration = Date.now() - startTime
        console.debug(`[${this.tableName}] Query executed in ${duration}ms`)
      }

      return data
    } catch (error) {
      if (error instanceof DatabaseError) throw error

      this.metrics.errors++
      console.error(`[${this.tableName}] Unexpected error:`, error)
      throw new ServiceError('An unexpected error occurred', error)
    }
  }

  /**
   * Execute a mutation (insert, update, delete) with cache invalidation
   * @param {Function} queryFn - Function that returns a Supabase query
   * @param {string|Array<string>} invalidateKeys - Cache keys to invalidate
   * @returns {Promise<any>} Mutation result data
   */
  async executeMutation(queryFn, invalidateKeys = null) {
    const result = await this.executeQuery(queryFn)

    // Invalidate cache
    if (invalidateKeys) {
      if (Array.isArray(invalidateKeys)) {
        invalidateKeys.forEach(key => this.invalidateCache(key))
      } else {
        this.invalidateCache(invalidateKeys)
      }
    } else {
      // Invalidate all cache if no specific keys provided
      this.invalidateCache()
    }

    return result
  }

  // ==========================================================================
  // Caching
  // ==========================================================================

  /**
   * Get data with caching
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch data if not cached
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<any>} Cached or fresh data
   */
  async getCached(key, fetchFn, ttl = null) {
    if (!this.config.cacheEnabled) {
      return await this.executeQuery(fetchFn)
    }

    const cacheTTL = ttl || this.config.cacheTTL
    const cached = this.cache.get(key)

    // Return cached data if valid
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      this.metrics.cacheHits++
      if (this.config.enableMetrics) {
        console.debug(`[${this.tableName}] Cache hit for key: ${key}`)
      }
      return cached.data
    }

    // Fetch fresh data
    this.metrics.cacheMisses++
    if (this.config.enableMetrics) {
      console.debug(`[${this.tableName}] Cache miss for key: ${key}`)
    }

    const data = await this.executeQuery(fetchFn)

    // Store in cache
    this.setCache(key, data)

    return data
  }

  /**
   * Set cache entry
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  setCache(key, data) {
    // Enforce max cache size
    if (this.cache.size >= this.config.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Invalidate cache for specific key or pattern
   * @param {string|null} key - Cache key to invalidate, pattern (e.g., 'user:'), or null for all
   */
  invalidateCache(key = null) {
    if (key) {
      // Check if this is a pattern (ends with ':' or contains wildcard)
      if (key.endsWith(':') || key.includes('*')) {
        // Pattern-based invalidation
        const keysToDelete = []
        const pattern = key.replace('*', '')
        for (const cacheKey of this.cache.keys()) {
          if (cacheKey.startsWith(pattern)) {
            keysToDelete.push(cacheKey)
          }
        }
        keysToDelete.forEach(k => this.cache.delete(k))
        if (this.config.enableMetrics) {
          console.debug(`[${this.tableName}] Cache invalidated for pattern: ${key} (${keysToDelete.length} entries)`)
        }
      } else {
        // Exact key invalidation
        this.cache.delete(key)
        if (this.config.enableMetrics) {
          console.debug(`[${this.tableName}] Cache invalidated for key: ${key}`)
        }
      }
    } else {
      this.cache.clear()
      if (this.config.enableMetrics) {
        console.debug(`[${this.tableName}] All cache cleared`)
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0
    }
  }

  // ==========================================================================
  // Request Deduplication
  // ==========================================================================

  /**
   * Execute request with deduplication
   * Prevents duplicate in-flight requests with the same key
   * @param {string} key - Request key
   * @param {Function} requestFn - Function to execute
   * @returns {Promise<any>} Request result
   */
  async dedupedRequest(key, requestFn) {
    if (!this.config.dedupeRequests) {
      return await requestFn()
    }

    // Check if request is already in-flight
    if (this.inflightRequests.has(key)) {
      if (this.config.enableMetrics) {
        console.debug(`[${this.tableName}] Deduped request for key: ${key}`)
      }
      return await this.inflightRequests.get(key)
    }

    // Execute request
    const promise = requestFn()
    this.inflightRequests.set(key, promise)

    try {
      const result = await promise
      this.inflightRequests.delete(key)
      return result
    } catch (error) {
      this.inflightRequests.delete(key)
      throw error
    }
  }

  // ==========================================================================
  // Real-time Subscriptions
  // ==========================================================================

  /**
   * Subscribe to real-time changes
   * @param {string} event - Event type ('INSERT', 'UPDATE', 'DELETE', or '*')
   * @param {Function} callback - Callback function
   * @param {string} filter - Optional filter string
   * @returns {Function} Unsubscribe function
   */
  subscribe(event = '*', callback, filter = null) {
    const channelName = `${this.tableName}_${event}_${Date.now()}`

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event,
        schema: 'public',
        table: this.tableName,
        filter
      }, (payload) => {
        if (this.config.enableMetrics) {
          console.debug(`[${this.tableName}] Real-time event:`, payload)
        }

        // Invalidate cache on changes
        this.invalidateCache()

        // Call user callback
        callback(payload)
      })
      .subscribe()

    // Store subscription
    this.subscriptions.set(channelName, channel)

    // Return unsubscribe function
    return () => {
      channel.unsubscribe()
      this.subscriptions.delete(channelName)
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll() {
    this.subscriptions.forEach(channel => channel.unsubscribe())
    this.subscriptions.clear()
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get service metrics
   * @returns {Object} Service metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      cache: this.getCacheStats(),
      subscriptions: this.subscriptions.size
    }
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      requests: 0,
      errors: 0
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.cache.clear()
    this.inflightRequests.clear()
    this.unsubscribeAll()
  }
}

// ============================================================================
// Error Handler Utility
// ============================================================================

/**
 * Handle service errors and return user-friendly messages
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export function handleServiceError(error) {
  if (error instanceof AuthenticationError) {
    return error.message
  }

  if (error instanceof ValidationError) {
    return error.errors.join(', ')
  }

  if (error instanceof DatabaseError) {
    // Map common database errors to user-friendly messages
    const errorMap = {
      '23505': 'This item already exists',
      '23503': 'Referenced item does not exist',
      '42501': 'Permission denied',
      'PGRST116': 'No rows found'
    }

    return errorMap[error.code] || 'Database error occurred'
  }

  if (error instanceof ServiceError) {
    return 'An unexpected error occurred. Please try again.'
  }

  return 'An unknown error occurred. Please try again.'
}

/**
 * Log error with context
 * @param {string} context - Error context
 * @param {Error} error - Error object
 */
export function logError(context, error) {
  console.error(`[${context}]`, {
    message: error.message,
    name: error.name,
    code: error.code,
    details: error.details,
    stack: error.stack
  })
}
