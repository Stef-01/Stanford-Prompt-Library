/**
 * AI Tools Service (Refactored)
 * Uses BaseService for standardized error handling and caching
 */

import { BaseService, AuthenticationError, ValidationError } from './base-service.js'
import { supabase } from '../config/supabase.js'
import { getCurrentUser } from './auth.js'
import { CACHE_TTL } from '../config/constants.js'

// ============================================================================
// AI Tools Service Class
// ============================================================================

class AIToolsService extends BaseService {
  constructor() {
    super('ai_tools', {
      cacheTTL: CACHE_TTL.MEDIUM,
      enableMetrics: true
    })
  }

  /**
   * Submit a new AI tool recommendation
   */
  async submitAITool(toolData) {
    const user = await getCurrentUser()
    if (!user) throw new AuthenticationError()

    // Validate required fields
    if (!toolData.name || !toolData.description || !toolData.url) {
      throw new ValidationError('Missing required fields', {
        name: !toolData.name,
        description: !toolData.description,
        url: !toolData.url
      })
    }

    const data = await this.executeQuery(() =>
      supabase
        .from('ai_tools')
        .insert({
          user_id: user.id,
          name: toolData.name,
          description: toolData.description,
          category: toolData.category,
          url: toolData.url,
          tags: toolData.tags || [],
          status: 'approved',
          is_public: true
        })
        .select()
        .single()
    )

    // Invalidate cache after new submission
    this.invalidateCache('approved_tools')
    this.invalidateCache(`my_tools:${user.id}`)

    return {
      success: true,
      message: '✅ AI tool submitted successfully!',
      data
    }
  }

  /**
   * Get all approved AI tools with filters
   */
  async getApprovedAITools(options = {}) {
    const cacheKey = `approved_tools:${JSON.stringify(options)}`

    return this.getCached(cacheKey, async () => {
      let query = supabase
        .from('ai_tools')
        .select(`
          *,
          users:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .eq('is_public', true)

      // Filter by category
      if (options.category && options.category !== 'all') {
        query = query.eq('category', options.category)
      }

      // Filter by time period
      if (options.timeFilter) {
        const now = new Date()
        let dateThreshold

        switch (options.timeFilter) {
          case 'week':
            dateThreshold = new Date(now.setDate(now.getDate() - 7))
            break
          case 'month':
            dateThreshold = new Date(now.setMonth(now.getMonth() - 1))
            break
          default:
            dateThreshold = null
        }

        if (dateThreshold) {
          query = query.gte('created_at', dateThreshold.toISOString())
        }
      }

      // Search by query
      if (options.searchQuery) {
        query = query.textSearch('search_vector', options.searchQuery)
      }

      // Sort
      const sortBy = options.sortBy || 'net_score'
      switch (sortBy) {
        case 'net_score':
          query = query.order('net_score', { ascending: false })
          break
        case 'upvotes':
          query = query.order('upvotes_count', { ascending: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        default:
          query = query.order('net_score', { ascending: false })
      }

      // Pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }

      return this.executeQuery(() => query)
    })
  }

  /**
   * Get user's submitted AI tools
   */
  async getMyAITools() {
    const user = await getCurrentUser()
    if (!user) return []

    const cacheKey = `my_tools:${user.id}`

    return this.getCached(cacheKey, async () => {
      return this.executeQuery(() =>
        supabase
          .from('ai_tools')
          .select(`
            *,
            users:user_id (
              display_name,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      )
    })
  }

  /**
   * Get a single AI tool by ID
   */
  async getAIToolById(toolId) {
    const cacheKey = `tool:${toolId}`

    return this.getCached(cacheKey, async () => {
      return this.executeQuery(() =>
        supabase
          .from('ai_tools')
          .select(`
            *,
            users:user_id (
              display_name,
              avatar_url
            )
          `)
          .eq('id', toolId)
          .single()
      )
    })
  }

  /**
   * Get tool categories
   */
  async getToolCategories() {
    return this.getCached('tool_categories', async () => {
      return this.executeQuery(() =>
        supabase
          .from('tool_categories')
          .select('*')
          .order('name', { ascending: true })
      )
    })
  }

  /**
   * Vote on an AI tool
   */
  async voteOnTool(toolId, voteType) {
    const user = await getCurrentUser()
    if (!user) throw new AuthenticationError()

    if (!['upvote', 'downvote'].includes(voteType)) {
      throw new ValidationError('Invalid vote type')
    }

    // Check for existing vote
    const existingVote = await this.executeQuery(() =>
      supabase
        .from('tool_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('tool_id', toolId)
        .maybeSingle()
    )

    let result

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote
        await this.executeQuery(() =>
          supabase
            .from('tool_votes')
            .delete()
            .eq('user_id', user.id)
            .eq('tool_id', toolId)
        )

        result = {
          success: true,
          action: 'removed',
          message: 'Vote removed'
        }
      } else {
        // Update vote
        await this.executeQuery(() =>
          supabase
            .from('tool_votes')
            .update({ vote_type: voteType })
            .eq('user_id', user.id)
            .eq('tool_id', toolId)
        )

        result = {
          success: true,
          action: 'updated',
          message: `Vote changed to ${voteType}`
        }
      }
    } else {
      // New vote
      await this.executeQuery(() =>
        supabase
          .from('tool_votes')
          .insert({
            user_id: user.id,
            tool_id: toolId,
            vote_type: voteType
          })
      )

      result = {
        success: true,
        action: 'added',
        message: `${voteType} recorded`
      }
    }

    // Invalidate relevant caches
    this.invalidateCache(`tool:${toolId}`)
    this.invalidateCache(`user_vote:${user.id}:${toolId}`)
    this.invalidateCache('approved_tools')

    return result
  }

  /**
   * Check if current user has voted on a tool
   */
  async getUserVote(toolId) {
    const user = await getCurrentUser()
    if (!user) return null

    const cacheKey = `user_vote:${user.id}:${toolId}`

    return this.getCached(cacheKey, async () => {
      return this.executeQuery(() =>
        supabase
          .from('tool_votes')
          .select('vote_type')
          .eq('user_id', user.id)
          .eq('tool_id', toolId)
          .maybeSingle()
      )
    })
  }

  /**
   * Get leaderboard of AI tools
   */
  async getAIToolsLeaderboard(timeFilter = 'all', limit = 50) {
    return this.getApprovedAITools({
      timeFilter,
      limit,
      sortBy: 'net_score'
    })
  }

  /**
   * Delete an AI tool
   */
  async deleteAITool(toolId) {
    const user = await getCurrentUser()
    if (!user) throw new AuthenticationError()

    // Verify ownership
    const tool = await this.executeQuery(() =>
      supabase
        .from('ai_tools')
        .select('user_id')
        .eq('id', toolId)
        .single()
    )

    if (tool.user_id !== user.id) {
      throw new ValidationError('Unauthorized to delete this tool')
    }

    await this.executeQuery(() =>
      supabase
        .from('ai_tools')
        .delete()
        .eq('id', toolId)
    )

    // Invalidate caches
    this.invalidateCache(`tool:${toolId}`)
    this.invalidateCache(`my_tools:${user.id}`)
    this.invalidateCache('approved_tools')

    return {
      success: true,
      message: 'Tool deleted successfully'
    }
  }

  /**
   * Update an AI tool
   */
  async updateAITool(toolId, updates) {
    const user = await getCurrentUser()
    if (!user) throw new AuthenticationError()

    const data = await this.executeQuery(() =>
      supabase
        .from('ai_tools')
        .update(updates)
        .eq('id', toolId)
        .eq('user_id', user.id)
        .select()
        .single()
    )

    // Invalidate caches
    this.invalidateCache(`tool:${toolId}`)
    this.invalidateCache(`my_tools:${user.id}`)
    this.invalidateCache('approved_tools')

    return {
      success: true,
      message: 'Tool updated successfully',
      data
    }
  }

  /**
   * Get vote statistics for a tool
   */
  async getToolVoteStats(toolId) {
    const cacheKey = `vote_stats:${toolId}`

    return this.getCached(cacheKey, async () => {
      return this.executeQuery(() =>
        supabase
          .from('ai_tools')
          .select('upvotes_count, downvotes_count, net_score')
          .eq('id', toolId)
          .single()
      )
    }, CACHE_TTL.SHORT) // Shorter TTL for vote stats
  }
}

// ============================================================================
// Export singleton instance and convenience functions
// ============================================================================

export const aiToolsService = new AIToolsService()

// Export convenience functions that delegate to the service
export const submitAITool = (data) => aiToolsService.submitAITool(data)
export const getApprovedAITools = (options) => aiToolsService.getApprovedAITools(options)
export const getMyAITools = () => aiToolsService.getMyAITools()
export const getAIToolById = (id) => aiToolsService.getAIToolById(id)
export const getToolCategories = () => aiToolsService.getToolCategories()
export const voteOnTool = (id, type) => aiToolsService.voteOnTool(id, type)
export const getUserVote = (id) => aiToolsService.getUserVote(id)
export const getAIToolsLeaderboard = (filter, limit) => aiToolsService.getAIToolsLeaderboard(filter, limit)
export const deleteAITool = (id) => aiToolsService.deleteAITool(id)
export const updateAITool = (id, updates) => aiToolsService.updateAITool(id, updates)
export const getToolVoteStats = (id) => aiToolsService.getToolVoteStats(id)

export default aiToolsService
