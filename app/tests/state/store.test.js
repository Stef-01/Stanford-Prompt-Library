/**
 * Store Tests
 * Tests for the state management Store class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Store } from '../../src/state/store.js'

describe('Store', () => {
  let store

  beforeEach(() => {
    store = new Store('test', { count: 0, user: null, nested: { value: 1 } })
  })

  describe('Constructor', () => {
    it('should initialize with name and initial state', () => {
      expect(store.name).toBe('test')
      expect(store.getState()).toEqual({ count: 0, user: null, nested: { value: 1 } })
    })

    it('should initialize with empty state if not provided', () => {
      const emptyStore = new Store('empty')
      expect(emptyStore.getState()).toEqual({})
    })

    it('should initialize with empty listeners, middlewares, and history', () => {
      expect(store.listeners.size).toBe(0)
      expect(store.middlewares.length).toBe(0)
      expect(store.history.length).toBe(0)
    })

    it('should set maxHistory to 50', () => {
      expect(store.maxHistory).toBe(50)
    })
  })

  describe('getState', () => {
    it('should return entire state when no path provided', () => {
      const state = store.getState()
      expect(state).toEqual({ count: 0, user: null, nested: { value: 1 } })
      expect(state).not.toBe(store.state) // Should return a copy
    })

    it('should return specific property with simple path', () => {
      expect(store.getState('count')).toBe(0)
      expect(store.getState('user')).toBeNull()
    })

    it('should return nested property with dot notation', () => {
      expect(store.getState('nested.value')).toBe(1)
    })

    it('should return undefined for non-existent path', () => {
      expect(store.getState('nonexistent')).toBeUndefined()
      expect(store.getState('nested.nonexistent')).toBeUndefined()
    })
  })

  describe('setState', () => {
    it('should update state and track changes', () => {
      store.setState({ count: 5 }, 'test')
      expect(store.getState('count')).toBe(5)
    })

    it('should update multiple properties at once', () => {
      store.setState({ count: 10, user: 'Alice' }, 'test')
      expect(store.getState('count')).toBe(10)
      expect(store.getState('user')).toBe('Alice')
    })

    it('should not update state with invalid input', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      store.setState(null, 'test')
      expect(store.getState('count')).toBe(0) // Unchanged

      store.setState('invalid', 'test')
      expect(store.getState('count')).toBe(0) // Unchanged

      consoleSpy.mockRestore()
    })

    it('should add state changes to history', () => {
      store.setState({ count: 5 }, 'test')
      const history = store.getHistory()

      expect(history.length).toBe(1)
      expect(history[0].source).toBe('test')
      expect(history[0].changedKeys).toEqual(['count'])
      expect(history[0].prevState.count).toBe(0)
      expect(history[0].nextState.count).toBe(5)
    })

    it('should only notify listeners when values actually change', () => {
      const callback = vi.fn()
      store.subscribe('count', callback)

      store.setState({ count: 0 }, 'test') // Same value
      expect(callback).not.toHaveBeenCalled()

      store.setState({ count: 5 }, 'test') // Different value
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('setProperty', () => {
    it('should update nested property with dot notation', () => {
      store.setProperty('nested.value', 42, 'test')
      expect(store.getState('nested.value')).toBe(42)
    })

    it('should handle deep nested paths', () => {
      store.setState({ deep: { nested: { value: 1 } } }, 'init')
      store.setProperty('deep.nested.value', 99, 'test')
      expect(store.getState('deep.nested.value')).toBe(99)
    })

    it('should handle invalid paths gracefully', () => {
      store.setProperty('nonexistent.path', 42, 'test')
      // Should not throw, just not update anything
      expect(store.getState('nonexistent')).toBeUndefined()
    })
  })

  describe('subscribe', () => {
    it('should call callback when subscribed key changes', () => {
      const callback = vi.fn()
      store.subscribe('count', callback)

      store.setState({ count: 5 }, 'test')

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ count: 5 }),
        expect.objectContaining({ count: 0 }),
        ['count']
      )
    })

    it('should not call callback when different key changes', () => {
      const callback = vi.fn()
      store.subscribe('count', callback)

      store.setState({ user: 'Alice' }, 'test')

      expect(callback).not.toHaveBeenCalled()
    })

    it('should support subscribing to multiple keys', () => {
      const callback = vi.fn()
      store.subscribe(['count', 'user'], callback)

      store.setState({ count: 5 }, 'test')
      expect(callback).toHaveBeenCalledTimes(1)

      store.setState({ user: 'Bob' }, 'test')
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should support wildcard subscriptions', () => {
      const callback = vi.fn()
      store.subscribe('*', callback)

      store.setState({ count: 5 }, 'test')
      expect(callback).toHaveBeenCalledTimes(1)

      store.setState({ user: 'Alice' }, 'test')
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should support nested path subscriptions', () => {
      const callback = vi.fn()
      store.subscribe('nested.value', callback)

      store.setState({ nested: { value: 42 } }, 'test')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should return unsubscribe function', () => {
      const callback = vi.fn()
      const unsubscribe = store.subscribe('count', callback)

      store.setState({ count: 5 }, 'test')
      expect(callback).toHaveBeenCalledTimes(1)

      unsubscribe()

      store.setState({ count: 10 }, 'test')
      expect(callback).toHaveBeenCalledTimes(1) // Not called again
    })

    it('should handle invalid callbacks gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const unsubscribe = store.subscribe('count', null)
      expect(unsubscribe).toBeInstanceOf(Function)

      consoleSpy.mockRestore()
    })

    it('should handle callback errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error')
      })

      store.subscribe('count', errorCallback)
      store.setState({ count: 5 }, 'test')

      expect(errorCallback).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('use (Middleware)', () => {
    it('should add middleware', () => {
      const middleware = vi.fn()
      store.use(middleware)

      expect(store.middlewares.length).toBe(1)
    })

    it('should run middleware on state changes', () => {
      const middleware = vi.fn()
      store.use(middleware)

      store.setState({ count: 5 }, 'test')

      expect(middleware).toHaveBeenCalledTimes(1)
      expect(middleware).toHaveBeenCalledWith(
        expect.objectContaining({
          store: 'test',
          prevState: expect.objectContaining({ count: 0 }),
          nextState: expect.objectContaining({ count: 5 }),
          source: 'test',
          changedKeys: ['count']
        })
      )
    })

    it('should run multiple middlewares in order', () => {
      const calls = []
      const middleware1 = vi.fn(() => calls.push(1))
      const middleware2 = vi.fn(() => calls.push(2))

      store.use(middleware1)
      store.use(middleware2)

      store.setState({ count: 5 }, 'test')

      expect(calls).toEqual([1, 2])
    })

    it('should handle middleware errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const errorMiddleware = vi.fn(() => {
        throw new Error('Middleware error')
      })

      store.use(errorMiddleware)
      store.setState({ count: 5 }, 'test')

      expect(errorMiddleware).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should not add invalid middleware', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      store.use(null)
      expect(store.middlewares.length).toBe(0)

      store.use('invalid')
      expect(store.middlewares.length).toBe(0)

      consoleSpy.mockRestore()
    })
  })

  describe('History', () => {
    it('should track state history', () => {
      store.setState({ count: 1 }, 'test1')
      store.setState({ count: 2 }, 'test2')
      store.setState({ count: 3 }, 'test3')

      const history = store.getHistory()
      expect(history.length).toBe(3)
      expect(history[2].nextState.count).toBe(3)
    })

    it('should limit history to maxHistory entries', () => {
      store.maxHistory = 5

      for (let i = 0; i < 10; i++) {
        store.setState({ count: i }, `test${i}`)
      }

      expect(store.history.length).toBe(5)
      expect(store.history[0].nextState.count).toBe(5) // Oldest should be #5
      expect(store.history[4].nextState.count).toBe(9) // Newest should be #9
    })

    it('should return limited history entries', () => {
      for (let i = 0; i < 20; i++) {
        store.setState({ count: i }, `test${i}`)
      }

      const history = store.getHistory(5)
      expect(history.length).toBe(5)
      expect(history[4].nextState.count).toBe(19) // Last entry
    })

    it('should include timestamp in history entries', () => {
      const before = Date.now()
      store.setState({ count: 5 }, 'test')
      const after = Date.now()

      const history = store.getHistory()
      expect(history[0].timestamp).toBeGreaterThanOrEqual(before)
      expect(history[0].timestamp).toBeLessThanOrEqual(after)
    })
  })

  describe('reset', () => {
    it('should reset state to initial values', () => {
      store.setState({ count: 10, user: 'Alice' }, 'test')

      store.reset({ count: 0, user: null, nested: { value: 1 } })

      expect(store.getState()).toEqual({ count: 0, user: null, nested: { value: 1 } })
    })

    it('should clear history on reset', () => {
      store.setState({ count: 1 }, 'test1')
      store.setState({ count: 2 }, 'test2')

      store.reset({ count: 0 })

      expect(store.history.length).toBe(0)
    })

    it('should notify listeners on reset', () => {
      const callback = vi.fn()
      store.subscribe('*', callback)

      store.reset({ count: 99 })

      expect(callback).toHaveBeenCalled()
    })

    it('should reset to empty state if no initial state provided', () => {
      store.setState({ count: 10 }, 'test')

      store.reset()

      expect(store.getState()).toEqual({})
    })
  })

  describe('clearListeners', () => {
    it('should clear all listeners', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      store.subscribe('count', callback1)
      store.subscribe('user', callback2)

      expect(store.listeners.size).toBe(2)

      store.clearListeners()

      expect(store.listeners.size).toBe(0)
    })

    it('should not notify cleared listeners', () => {
      const callback = vi.fn()
      store.subscribe('count', callback)

      store.clearListeners()
      store.setState({ count: 5 }, 'test')

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('getStats', () => {
    it('should return store statistics', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const middleware = vi.fn()

      store.subscribe('count', callback1)
      store.subscribe('user', callback2)
      store.use(middleware)
      store.setState({ count: 1 }, 'test')

      const stats = store.getStats()

      expect(stats).toEqual({
        name: 'test',
        stateKeys: 3, // count, user, nested
        listeners: 2,
        middlewares: 1,
        historySize: 1
      })
    })
  })

  describe('Integration Tests', () => {
    it('should handle complex subscription patterns', () => {
      const allChanges = vi.fn()
      const countChanges = vi.fn()
      const nestedChanges = vi.fn()

      store.subscribe('*', allChanges)
      store.subscribe('count', countChanges)
      store.subscribe('nested.value', nestedChanges)

      store.setState({ count: 5 }, 'test1')
      expect(allChanges).toHaveBeenCalledTimes(1)
      expect(countChanges).toHaveBeenCalledTimes(1)
      expect(nestedChanges).not.toHaveBeenCalled()

      store.setState({ nested: { value: 42 } }, 'test2')
      expect(allChanges).toHaveBeenCalledTimes(2)
      expect(countChanges).toHaveBeenCalledTimes(1)
      expect(nestedChanges).toHaveBeenCalledTimes(1)
    })

    it('should handle middleware and listeners together', () => {
      const middlewareOrder = []
      const listenerOrder = []

      const middleware = vi.fn(() => middlewareOrder.push('middleware'))
      const listener = vi.fn(() => listenerOrder.push('listener'))

      store.use(middleware)
      store.subscribe('count', listener)

      store.setState({ count: 5 }, 'test')

      expect(middleware).toHaveBeenCalled()
      expect(listener).toHaveBeenCalled()
      // Middlewares run before listeners
      expect(middlewareOrder[0]).toBe('middleware')
    })

    it('should maintain immutability of state copies', () => {
      const state1 = store.getState()
      state1.count = 999

      expect(store.getState('count')).toBe(0) // Should not be affected
    })
  })
})
