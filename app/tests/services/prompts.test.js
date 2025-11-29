/**
 * Prompts Service Tests
 * Tests for the prompts service including caching, authentication, and CRUD operations
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { PromptsService } from '../../src/services/prompts.js'
import { AuthenticationError, ValidationError } from '../../src/services/base-service.js'

// Mock modules
vi.mock('../../src/config/supabase.js', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    },
    storage: {
      from: vi.fn()
    }
  }
}))

vi.mock('../../src/services/auth.js', () => ({
  getCurrentUser: vi.fn()
}))

vi.mock('../../src/config/constants.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    validatePrompt: vi.fn(),
    CACHE_TTL: {
      SHORT: 5000,
      MEDIUM: 10000,
      LONG: 30000
    }
  }
})

import { supabase } from '../../src/config/supabase.js'
import { getCurrentUser } from '../../src/services/auth.js'
import { validatePrompt } from '../../src/config/constants.js'

describe('PromptsService', () => {
  let service
  let mockQuery

  beforeEach(() => {
    service = new PromptsService()

    // Reset all mocks
    vi.clearAllMocks()

    // Create mock query chain that is also a promise
    const createMockQuery = (resolveValue = { data: null, error: null }) => {
      const query = Promise.resolve(resolveValue)
      query.select = vi.fn().mockReturnValue(createMockQuery(resolveValue))
      query.insert = vi.fn().mockReturnValue(createMockQuery(resolveValue))
      query.update = vi.fn().mockReturnValue(createMockQuery(resolveValue))
      query.delete = vi.fn().mockReturnValue(createMockQuery(resolveValue))
      query.eq = vi.fn().mockReturnValue(createMockQuery(resolveValue))
      query.contains = vi.fn().mockReturnValue(createMockQuery(resolveValue))
      query.textSearch = vi.fn().mockReturnValue(createMockQuery(resolveValue))
      query.order = vi.fn().mockReturnValue(createMockQuery(resolveValue))
      query.limit = vi.fn().mockReturnValue(createMockQuery(resolveValue))
      query.gte = vi.fn().mockReturnValue(createMockQuery(resolveValue))
      query.gt = vi.fn().mockReturnValue(createMockQuery(resolveValue))
      query.single = vi.fn().mockReturnValue(Promise.resolve(resolveValue))
      return query
    }

    mockQuery = createMockQuery()

    // Setup supabase.from to return mock query
    supabase.from.mockReturnValue(mockQuery)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Constructor', () => {
    it('should initialize with prompts table and medium cache TTL', () => {
      expect(service.tableName).toBe('prompts')
      expect(service.config.enableMetrics).toBe(true)
    })
  })

  describe('submitPrompt', () => {
    it('should throw AuthenticationError if user not logged in', async () => {
      getCurrentUser.mockResolvedValue(null)

      await expect(service.submitPrompt({})).rejects.toThrow(AuthenticationError)
    })

    it('should throw ValidationError if prompt data invalid', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-123' })
      validatePrompt.mockReturnValue({
        valid: false,
        errors: ['Title too short', 'Missing description']
      })

      await expect(
        service.submitPrompt({ title: 'Hi' })
      ).rejects.toThrow(ValidationError)
    })

    it('should submit prompt with valid data', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-123' })
      validatePrompt.mockReturnValue({ valid: true, errors: [] })

      // Mock user data query
      const userDataValue = {
        data: {
          has_submitted_prompt: false,
          display_name: 'John Doe'
        },
        error: null
      }
      const userDataQuery = Promise.resolve(userDataValue)
      userDataQuery.select = vi.fn().mockReturnValue(userDataQuery)
      userDataQuery.eq = vi.fn().mockReturnValue(userDataQuery)
      userDataQuery.single = vi.fn().mockReturnValue(Promise.resolve(userDataValue))

      // Mock prompt insert query
      const promptInsertValue = {
        data: {
          id: 'prompt-123',
          title: 'Test Prompt',
          user_id: 'user-123'
        },
        error: null
      }
      const promptInsertQuery = Promise.resolve(promptInsertValue)
      promptInsertQuery.insert = vi.fn().mockReturnValue(promptInsertQuery)
      promptInsertQuery.select = vi.fn().mockReturnValue(promptInsertQuery)
      promptInsertQuery.single = vi.fn().mockReturnValue(Promise.resolve(promptInsertValue))

      supabase.from
        .mockReturnValueOnce(userDataQuery) // First call for user data
        .mockReturnValueOnce(promptInsertQuery) // Second call for prompt insert

      const result = await service.submitPrompt({
        title: 'Test Prompt',
        content: 'Test content',
        description: 'Test description',
        category: 'general',
        tags: ['test']
      })

      expect(result.success).toBe(true)
      expect(result.prompt.id).toBe('prompt-123')
      expect(result.isInitialPrompt).toBe(true)
      expect(result.message).toContain('first prompt')
    })

    it('should handle subsequent prompts correctly', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-123' })
      validatePrompt.mockReturnValue({ valid: true, errors: [] })

      const userDataValue = {
        data: {
          has_submitted_prompt: true,
          display_name: 'John Doe'
        },
        error: null
      }
      const userDataQuery = Promise.resolve(userDataValue)
      userDataQuery.select = vi.fn().mockReturnValue(userDataQuery)
      userDataQuery.eq = vi.fn().mockReturnValue(userDataQuery)
      userDataQuery.single = vi.fn().mockReturnValue(Promise.resolve(userDataValue))

      const promptInsertValue = {
        data: {
          id: 'prompt-124',
          title: 'Another Prompt'
        },
        error: null
      }
      const promptInsertQuery = Promise.resolve(promptInsertValue)
      promptInsertQuery.insert = vi.fn().mockReturnValue(promptInsertQuery)
      promptInsertQuery.select = vi.fn().mockReturnValue(promptInsertQuery)
      promptInsertQuery.single = vi.fn().mockReturnValue(Promise.resolve(promptInsertValue))

      supabase.from
        .mockReturnValueOnce(userDataQuery)
        .mockReturnValueOnce(promptInsertQuery)

      const result = await service.submitPrompt({
        title: 'Another Prompt',
        content: 'More content',
        description: 'Description',
        category: 'general'
      })

      expect(result.isInitialPrompt).toBe(false)
      expect(result.message).not.toContain('first prompt')
    })
  })

  describe('getApprovedPrompts', () => {
    beforeEach(() => {
      // Create a fresh mock query for each test with default empty array
      const createQueryWithData = (data) => {
        const value = { data, error: null }
        const query = Promise.resolve(value)
        query.select = vi.fn().mockReturnValue(query)
        query.eq = vi.fn().mockReturnValue(query)
        query.contains = vi.fn().mockReturnValue(query)
        query.textSearch = vi.fn().mockReturnValue(query)
        query.order = vi.fn().mockReturnValue(query)
        query.limit = vi.fn().mockReturnValue(query)
        return query
      }

      mockQuery = createQueryWithData([])
      supabase.from.mockReturnValue(mockQuery)
    })

    it('should fetch approved prompts', async () => {
      const data = [
        { id: '1', title: 'Prompt 1', status: 'approved', is_public: true },
        { id: '2', title: 'Prompt 2', status: 'approved', is_public: true }
      ]
      const value = { data, error: null }
      const query = Promise.resolve(value)
      query.select = vi.fn().mockReturnValue(query)
      query.eq = vi.fn().mockReturnValue(query)
      query.order = vi.fn().mockReturnValue(query)
      supabase.from.mockReturnValue(query)

      const prompts = await service.getApprovedPrompts()

      expect(prompts).toHaveLength(2)
    })

    it('should apply category filter', async () => {
      await service.getApprovedPrompts({ category: 'coding' })

      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'coding')
    })

    it('should apply tags filter', async () => {
      await service.getApprovedPrompts({ tags: ['python', 'data'] })

      expect(mockQuery.contains).toHaveBeenCalledWith('tags', ['python', 'data'])
    })

    it('should apply search filter', async () => {
      await service.getApprovedPrompts({ search: 'test query' })

      expect(mockQuery.textSearch).toHaveBeenCalledWith('search_vector', 'test query')
    })

    it('should apply sorting by likes', async () => {
      await service.getApprovedPrompts({ sortBy: 'likes' })

      expect(mockQuery.order).toHaveBeenCalledWith('likes_count', { ascending: false })
    })

    it('should apply limit for pagination', async () => {
      await service.getApprovedPrompts({ limit: 20 })

      expect(mockQuery.limit).toHaveBeenCalledWith(20)
    })
  })

  describe('getMyPrompts', () => {
    it('should return empty array if user not logged in', async () => {
      getCurrentUser.mockResolvedValue(null)

      const prompts = await service.getMyPrompts()

      expect(prompts).toEqual([])
    })

    it('should fetch user prompts when logged in', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.single = vi.fn().mockResolvedValue({
        data: [
          { id: '1', title: 'My Prompt 1', user_id: 'user-123' },
          { id: '2', title: 'My Prompt 2', user_id: 'user-123' }
        ],
        error: null
      })

      const prompts = await service.getMyPrompts()

      expect(prompts).toHaveLength(2)
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123')
    })
  })

  describe('getPromptById', () => {
    it('should fetch prompt by ID', async () => {
      mockQuery.single.mockResolvedValue({
        data: {
          id: 'prompt-123',
          title: 'Test Prompt',
          users: {
            display_name: 'John Doe',
            avatar_url: 'avatar.jpg'
          }
        },
        error: null
      })

      const prompt = await service.getPromptById('prompt-123')

      expect(prompt.id).toBe('prompt-123')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'prompt-123')
      expect(mockQuery.single).toHaveBeenCalled()
    })
  })

  describe('likePrompt', () => {
    it('should throw AuthenticationError if user not logged in', async () => {
      getCurrentUser.mockResolvedValue(null)

      await expect(service.likePrompt('prompt-123')).rejects.toThrow(AuthenticationError)
    })

    it('should insert like when user is authenticated', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.single = vi.fn().mockResolvedValue({ data: { id: 'like-1' }, error: null })

      const result = await service.likePrompt('prompt-123')

      expect(result.liked).toBe(true)
      expect(supabase.from).toHaveBeenCalledWith('likes')
      expect(mockQuery.insert).toHaveBeenCalledWith([{
        user_id: 'user-123',
        prompt_id: 'prompt-123'
      }])
    })

    it('should unlike if already liked (duplicate key error)', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-123' })

      // First call (like) throws duplicate key error
      mockQuery.single = vi.fn().mockRejectedValueOnce({
        code: '23505'
      })

      // Second call (unlike) succeeds
      const unlikeQuery = {
        ...mockQuery,
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      }

      supabase.from
        .mockReturnValueOnce(mockQuery) // First call for like (fails)
        .mockReturnValueOnce(unlikeQuery) // Second call for unlike (succeeds)

      const result = await service.likePrompt('prompt-123')

      expect(result.liked).toBe(false)
    })
  })

  describe('unlikePrompt', () => {
    it('should throw AuthenticationError if user not logged in', async () => {
      getCurrentUser.mockResolvedValue(null)

      await expect(service.unlikePrompt('prompt-123')).rejects.toThrow(AuthenticationError)
    })

    it('should delete like when user is authenticated', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.single = vi.fn().mockResolvedValue({ data: null, error: null })

      const result = await service.unlikePrompt('prompt-123')

      expect(result.liked).toBe(false)
      expect(supabase.from).toHaveBeenCalledWith('likes')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(mockQuery.eq).toHaveBeenCalledWith('prompt_id', 'prompt-123')
    })
  })

  describe('hasLiked', () => {
    it('should return false if user not logged in', async () => {
      getCurrentUser.mockResolvedValue(null)

      const result = await service.hasLiked('prompt-123')

      expect(result).toBe(false)
    })

    it('should return true if user has liked the prompt', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.single.mockResolvedValue({
        data: { id: 'like-1' },
        error: null
      })

      const result = await service.hasLiked('prompt-123')

      expect(result).toBe(true)
    })

    it('should return false if user has not liked the prompt', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user-123' })
      mockQuery.single.mockRejectedValue({ code: 'PGRST116' }) // No rows found

      const result = await service.hasLiked('prompt-123')

      expect(result).toBe(false)
    })
  })

  describe('getCategories', () => {
    it('should fetch and cache categories', async () => {
      mockQuery.single = vi.fn().mockResolvedValue({
        data: [
          { id: '1', name: 'Coding' },
          { id: '2', name: 'Writing' }
        ],
        error: null
      })

      const categories = await service.getCategories()

      expect(categories).toHaveLength(2)
      expect(supabase.from).toHaveBeenCalledWith('categories')
      expect(mockQuery.order).toHaveBeenCalledWith('name')
    })
  })

  describe('getLeaderboard', () => {
    it('should fetch leaderboard with default limit', async () => {
      mockQuery.single = vi.fn().mockResolvedValue({
        data: [
          { display_name: 'User 1', total_likes_received: 100 },
          { display_name: 'User 2', total_likes_received: 50 }
        ],
        error: null
      })

      const leaderboard = await service.getLeaderboard()

      expect(leaderboard).toHaveLength(2)
      expect(mockQuery.eq).toHaveBeenCalledWith('is_approved_member', true)
      expect(mockQuery.gt).toHaveBeenCalledWith('total_prompts', 0)
      expect(mockQuery.limit).toHaveBeenCalledWith(10)
    })

    it('should fetch leaderboard with custom limit', async () => {
      mockQuery.single = vi.fn().mockResolvedValue({ data: [], error: null })

      await service.getLeaderboard(20)

      expect(mockQuery.limit).toHaveBeenCalledWith(20)
    })
  })

  describe('getTimeBasedLeaderboard', () => {
    it('should use regular leaderboard for "all" time filter', async () => {
      mockQuery.single = vi.fn().mockResolvedValue({ data: [], error: null })

      await service.getTimeBasedLeaderboard('all', 10)

      expect(supabase.from).toHaveBeenCalledWith('users')
    })

    it('should filter prompts for "week" time filter', async () => {
      mockQuery.single = vi.fn().mockResolvedValue({
        data: [
          {
            user_id: 'user-1',
            likes_count: 10,
            users: { display_name: 'User 1', avatar_url: null }
          }
        ],
        error: null
      })

      const result = await service.getTimeBasedLeaderboard('week', 10)

      expect(supabase.from).toHaveBeenCalledWith('prompts')
      expect(mockQuery.gte).toHaveBeenCalled() // Check for date filtering
      expect(result).toBeInstanceOf(Array)
    })

    it('should aggregate user stats correctly', async () => {
      mockQuery.single = vi.fn().mockResolvedValue({
        data: [
          {
            user_id: 'user-1',
            likes_count: 10,
            users: { display_name: 'User 1', avatar_url: null }
          },
          {
            user_id: 'user-1',
            likes_count: 5,
            users: { display_name: 'User 1', avatar_url: null }
          },
          {
            user_id: 'user-2',
            likes_count: 20,
            users: { display_name: 'User 2', avatar_url: null }
          }
        ],
        error: null
      })

      const result = await service.getTimeBasedLeaderboard('month', 10)

      expect(result).toHaveLength(2)
      expect(result[0].total_likes_received).toBe(20) // User 2 with highest likes
      expect(result[1].total_likes_received).toBe(15) // User 1 with combined likes (10 + 5)
      expect(result[1].total_prompts).toBe(2) // User 1 has 2 prompts
    })
  })

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', async () => {
      const mockWriteText = vi.fn().mockResolvedValue()
      global.navigator = {
        clipboard: {
          writeText: mockWriteText
        }
      }

      const result = await service.copyToClipboard('Test prompt text')

      expect(result).toBe(true)
      expect(mockWriteText).toHaveBeenCalledWith('Test prompt text')
    })

    it('should handle clipboard errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      global.navigator = {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard error'))
        }
      }

      const result = await service.copyToClipboard('Test text')

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('exportAsMarkdown', () => {
    it('should export prompt as markdown file', () => {
      const mockClick = vi.fn()
      const mockRevokeObjectURL = vi.fn()
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:fake-url')

      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = mockRevokeObjectURL
      global.document = {
        createElement: vi.fn().mockReturnValue({
          href: '',
          download: '',
          click: mockClick
        })
      }

      const prompt = {
        title: 'Test Prompt',
        description: 'Test description',
        prompt_text: 'Test prompt content',
        tags: ['test', 'example'],
        category: 'general'
      }

      service.exportAsMarkdown(prompt)

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:fake-url')
    })
  })

  describe('Caching Behavior', () => {
    it('should cache approved prompts', async () => {
      mockQuery.single = vi.fn().mockResolvedValue({
        data: [{ id: '1', title: 'Prompt 1' }],
        error: null
      })

      const result1 = await service.getApprovedPrompts()
      const result2 = await service.getApprovedPrompts()

      // Should only query once due to caching
      expect(supabase.from).toHaveBeenCalledTimes(1)
      expect(result1).toEqual(result2)
    })

    it('should cache categories with long TTL', async () => {
      mockQuery.single = vi.fn().mockResolvedValue({
        data: [{ id: '1', name: 'Category 1' }],
        error: null
      })

      const result1 = await service.getCategories()
      const result2 = await service.getCategories()

      expect(supabase.from).toHaveBeenCalledTimes(1)
      expect(result1).toEqual(result2)
    })
  })
})
