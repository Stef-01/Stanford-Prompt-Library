/**
 * BaseService Tests
 * Tests for the base service class including caching, error handling, and query execution
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  BaseService,
  DatabaseError,
  ServiceError,
  ValidationError,
  AuthenticationError,
} from '../../src/services/base-service.js'
import { CACHE_TTL } from '../../src/config/constants.js'

describe('Custom Error Classes', () => {
  it('should create DatabaseError with correct properties', () => {
    const error = new DatabaseError('Database failed', 'DB001', { table: 'users' })

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('DatabaseError')
    expect(error.message).toBe('Database failed')
    expect(error.code).toBe('DB001')
    expect(error.details).toEqual({ table: 'users' })
  })

  it('should create ServiceError with original error', () => {
    const original = new Error('Original error')
    const error = new ServiceError('Service failed', original)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ServiceError')
    expect(error.message).toBe('Service failed')
    expect(error.originalError).toBe(original)
  })

  it('should create ValidationError with errors array', () => {
    const errors = ['Field required', 'Invalid format']
    const error = new ValidationError('Validation failed', errors)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ValidationError')
    expect(error.errors).toEqual(errors)
  })

  it('should create AuthenticationError with default message', () => {
    const error = new AuthenticationError()

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('AuthenticationError')
    expect(error.message).toBe('You must be signed in to perform this action')
  })
})

describe('BaseService', () => {
  let service

  beforeEach(() => {
    service = new BaseService('test_table')
  })

  describe('Constructor', () => {
    it('should initialize with table name', () => {
      expect(service.tableName).toBe('test_table')
    })

    it('should initialize with default config', () => {
      expect(service.config.cacheEnabled).toBe(true)
      expect(service.config.cacheTTL).toBe(CACHE_TTL.MEDIUM)
      expect(service.config.maxCacheSize).toBe(100)
      expect(service.config.dedupeRequests).toBe(true)
      expect(service.config.enableMetrics).toBe(true)
    })

    it('should allow custom config options', () => {
      const customService = new BaseService('custom_table', {
        cacheEnabled: false,
        cacheTTL: CACHE_TTL.LONG,
        maxCacheSize: 50,
      })

      expect(customService.config.cacheEnabled).toBe(false)
      expect(customService.config.cacheTTL).toBe(CACHE_TTL.LONG)
      expect(customService.config.maxCacheSize).toBe(50)
    })

    it('should initialize empty cache and metrics', () => {
      expect(service.cache.size).toBe(0)
      expect(service.metrics).toEqual({
        cacheHits: 0,
        cacheMisses: 0,
        requests: 0,
        errors: 0,
      })
    })
  })

  describe('executeQuery', () => {
    it('should execute query successfully and return data', async () => {
      const mockData = { id: 1, name: 'Test' }
      const queryFn = vi.fn(() => Promise.resolve({ data: mockData, error: null }))

      const result = await service.executeQuery(queryFn)

      expect(result).toEqual(mockData)
      expect(queryFn).toHaveBeenCalledTimes(1)
      expect(service.metrics.requests).toBe(1)
      expect(service.metrics.errors).toBe(0)
    })

    it('should throw DatabaseError on query error', async () => {
      const mockError = { message: 'Query failed', code: 'Q001', details: null }
      const queryFn = vi.fn(() => Promise.resolve({ data: null, error: mockError }))

      await expect(service.executeQuery(queryFn)).rejects.toThrow(DatabaseError)
      expect(service.metrics.requests).toBe(1)
      expect(service.metrics.errors).toBe(1)
    })

    it('should handle null/empty data correctly', async () => {
      const queryFn = vi.fn(() => Promise.resolve({ data: null, error: null }))

      const result = await service.executeQuery(queryFn)

      expect(result).toBeNull()
      expect(service.metrics.errors).toBe(0)
    })

    it('should handle array data correctly', async () => {
      const mockData = [{ id: 1 }, { id: 2 }]
      const queryFn = vi.fn(() => Promise.resolve({ data: mockData, error: null }))

      const result = await service.executeQuery(queryFn)

      expect(result).toEqual(mockData)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getCached', () => {
    it('should cache results with valid TTL', async () => {
      const mockData = { id: 1, name: 'Cached' }
      const queryFn = vi.fn(() => Promise.resolve({ data: mockData, error: null }))

      const result1 = await service.getCached('cache-key', queryFn)
      const result2 = await service.getCached('cache-key', queryFn)

      expect(result1).toEqual(mockData)
      expect(result2).toEqual(mockData)
      expect(queryFn).toHaveBeenCalledTimes(1) // Only called once
      expect(service.metrics.cacheHits).toBe(1)
      expect(service.metrics.cacheMisses).toBe(1)
    })

    it('should not cache if caching is disabled', async () => {
      const noCacheService = new BaseService('test', { cacheEnabled: false })
      const mockData = { id: 1 }
      const queryFn = vi.fn(() => Promise.resolve({ data: mockData, error: null }))

      await noCacheService.getCached('key', queryFn)
      await noCacheService.getCached('key', queryFn)

      expect(queryFn).toHaveBeenCalledTimes(2) // Called twice
      expect(noCacheService.metrics.cacheHits).toBe(0)
    })

    it('should expire cache after TTL', async () => {
      const shortTTLService = new BaseService('test', { cacheTTL: 10 }) // 10ms TTL
      const mockData = { id: 1 }
      const queryFn = vi.fn(() => Promise.resolve({ data: mockData, error: null }))

      await shortTTLService.getCached('key', queryFn)

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 20))

      await shortTTLService.getCached('key', queryFn)

      expect(queryFn).toHaveBeenCalledTimes(2) // Called twice after expiration
    })

    it('should use different cache keys for different queries', async () => {
      const queryFn1 = vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
      const queryFn2 = vi.fn(() => Promise.resolve({ data: { id: 2 }, error: null }))

      const result1 = await service.getCached('key1', queryFn1)
      const result2 = await service.getCached('key2', queryFn2)

      expect(result1.id).toBe(1)
      expect(result2.id).toBe(2)
      expect(queryFn1).toHaveBeenCalledTimes(1)
      expect(queryFn2).toHaveBeenCalledTimes(1)
    })

    it('should handle query errors correctly', async () => {
      const queryFn = vi.fn(() =>
        Promise.resolve({ data: null, error: { message: 'Error', code: 'E001' } })
      )

      await expect(service.getCached('key', queryFn)).rejects.toThrow(DatabaseError)

      // Should not cache errors
      await expect(service.getCached('key', queryFn)).rejects.toThrow(DatabaseError)
      expect(queryFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('invalidateCache', () => {
    it('should invalidate specific cache key', async () => {
      const queryFn = vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))

      await service.getCached('key1', queryFn)
      service.invalidateCache('key1')
      await service.getCached('key1', queryFn)

      expect(queryFn).toHaveBeenCalledTimes(2) // Called twice due to invalidation
    })

    it('should invalidate multiple cache keys with pattern', async () => {
      const queryFn = vi.fn(() => Promise.resolve({ data: {}, error: null }))

      await service.getCached('user:1', queryFn)
      await service.getCached('user:2', queryFn)
      await service.getCached('post:1', queryFn)

      service.invalidateCache('user:')

      await service.getCached('user:1', queryFn)
      await service.getCached('user:2', queryFn)
      await service.getCached('post:1', queryFn) // Should still be cached

      expect(queryFn).toHaveBeenCalledTimes(5) // 3 initial + 2 invalidated
    })

    it('should clear all cache if no pattern provided', async () => {
      const queryFn = vi.fn(() => Promise.resolve({ data: {}, error: null }))

      await service.getCached('key1', queryFn)
      await service.getCached('key2', queryFn)
      await service.getCached('key3', queryFn)

      service.invalidateCache() // Clear all

      await service.getCached('key1', queryFn)
      await service.getCached('key2', queryFn)
      await service.getCached('key3', queryFn)

      expect(queryFn).toHaveBeenCalledTimes(6) // 3 initial + 3 after clear
    })

    it('should handle non-existent cache keys gracefully', () => {
      expect(() => service.invalidateCache('nonexistent')).not.toThrow()
    })
  })

  describe('Cache Size Management', () => {
    it('should respect max cache size', async () => {
      const smallCacheService = new BaseService('test', { maxCacheSize: 3 })
      const queryFn = (id) => vi.fn(() =>
        Promise.resolve({ data: { id }, error: null })
      )

      await smallCacheService.getCached('key1', queryFn(1))
      await smallCacheService.getCached('key2', queryFn(2))
      await smallCacheService.getCached('key3', queryFn(3))
      await smallCacheService.getCached('key4', queryFn(4)) // Should evict oldest

      expect(smallCacheService.cache.size).toBeLessThanOrEqual(3)
    })
  })

  describe('Metrics', () => {
    it('should track cache hits and misses correctly', async () => {
      const queryFn = vi.fn(() => Promise.resolve({ data: {}, error: null }))

      await service.getCached('key1', queryFn) // Miss
      await service.getCached('key1', queryFn) // Hit
      await service.getCached('key2', queryFn) // Miss
      await service.getCached('key2', queryFn) // Hit

      expect(service.metrics.cacheHits).toBe(2)
      expect(service.metrics.cacheMisses).toBe(2)
    })

    it('should track request count', async () => {
      const queryFn = () => Promise.resolve({ data: {}, error: null })

      await service.executeQuery(queryFn)
      await service.executeQuery(queryFn)
      await service.executeQuery(queryFn)

      expect(service.metrics.requests).toBe(3)
    })

    it('should track error count', async () => {
      const errorFn = () => Promise.resolve({
        data: null,
        error: { message: 'Error', code: 'E001' }
      })

      try {
        await service.executeQuery(errorFn)
      } catch (e) {
        // Expected
      }

      try {
        await service.executeQuery(errorFn)
      } catch (e) {
        // Expected
      }

      expect(service.metrics.errors).toBe(2)
    })
  })
})
