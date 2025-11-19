/**
 * AI Tools Service
 * Handles all AI tool recommendation operations including CRUD, voting, and leaderboard
 */

import { supabase } from '../config/supabase.js'

/**
 * Submit a new AI tool recommendation
 * @param {Object} toolData - Tool information
 * @returns {Object} Result with success status and message
 */
export async function submitAITool(toolData) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('ai_tools')
      .insert({
        user_id: user.id,
        name: toolData.name,
        description: toolData.description,
        category: toolData.category,
        url: toolData.url,
        tags: toolData.tags || [],
        status: 'approved', // Auto-approve for now, can be changed to 'pending'
        is_public: true
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      message: '✅ AI tool submitted successfully!',
      data
    }
  } catch (error) {
    console.error('Error submitting AI tool:', error)
    throw error
  }
}

/**
 * Get all approved AI tools
 * @param {Object} options - Filter options
 * @returns {Array} List of approved tools
 */
export async function getApprovedAITools(options = {}) {
  try {
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

    // Filter by time period for leaderboard
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

    const { data, error } = await query

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching AI tools:', error)
    return []
  }
}

/**
 * Get user's submitted AI tools
 * @returns {Array} User's tools
 */
export async function getMyAITools() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
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

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching my AI tools:', error)
    return []
  }
}

/**
 * Get a single AI tool by ID
 * @param {string} toolId - Tool UUID
 * @returns {Object|null} Tool data
 */
export async function getAIToolById(toolId) {
  try {
    const { data, error } = await supabase
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

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching AI tool:', error)
    return null
  }
}

/**
 * Get tool categories
 * @returns {Array} List of categories
 */
export async function getToolCategories() {
  try {
    const { data, error } = await supabase
      .from('tool_categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching tool categories:', error)
    return []
  }
}

/**
 * Vote on an AI tool (upvote or downvote)
 * @param {string} toolId - Tool UUID
 * @param {string} voteType - 'upvote' or 'downvote'
 * @returns {Object} Result
 */
export async function voteOnTool(toolId, voteType) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    if (!['upvote', 'downvote'].includes(voteType)) {
      throw new Error('Invalid vote type')
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('tool_votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .maybeSingle()

    if (existingVote) {
      // User has already voted
      if (existingVote.vote_type === voteType) {
        // Same vote - remove it (toggle off)
        const { error } = await supabase
          .from('tool_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('tool_id', toolId)

        if (error) throw error

        return {
          success: true,
          action: 'removed',
          message: 'Vote removed'
        }
      } else {
        // Different vote - update it
        const { error } = await supabase
          .from('tool_votes')
          .update({ vote_type: voteType })
          .eq('user_id', user.id)
          .eq('tool_id', toolId)

        if (error) throw error

        return {
          success: true,
          action: 'updated',
          message: `Vote changed to ${voteType}`
        }
      }
    } else {
      // New vote
      const { error } = await supabase
        .from('tool_votes')
        .insert({
          user_id: user.id,
          tool_id: toolId,
          vote_type: voteType
        })

      if (error) throw error

      return {
        success: true,
        action: 'added',
        message: `${voteType} recorded`
      }
    }
  } catch (error) {
    console.error('Error voting on tool:', error)
    throw error
  }
}

/**
 * Check if current user has voted on a tool
 * @param {string} toolId - Tool UUID
 * @returns {Object|null} Vote data or null
 */
export async function getUserVote(toolId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('tool_votes')
      .select('vote_type')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .maybeSingle()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error checking user vote:', error)
    return null
  }
}

/**
 * Get leaderboard of AI tools
 * @param {string} timeFilter - 'all', 'month', 'week'
 * @param {number} limit - Number of results
 * @returns {Array} Top tools
 */
export async function getAIToolsLeaderboard(timeFilter = 'all', limit = 50) {
  return getApprovedAITools({
    timeFilter,
    limit,
    sortBy: 'net_score'
  })
}

/**
 * Delete an AI tool (user can only delete their own)
 * @param {string} toolId - Tool UUID
 * @returns {Object} Result
 */
export async function deleteAITool(toolId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Verify ownership
    const { data: tool } = await supabase
      .from('ai_tools')
      .select('user_id')
      .eq('id', toolId)
      .single()

    if (tool.user_id !== user.id) {
      throw new Error('Unauthorized to delete this tool')
    }

    const { error } = await supabase
      .from('ai_tools')
      .delete()
      .eq('id', toolId)

    if (error) throw error

    return {
      success: true,
      message: 'Tool deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting AI tool:', error)
    throw error
  }
}

/**
 * Update an AI tool (user can only update their own pending tools)
 * @param {string} toolId - Tool UUID
 * @param {Object} updates - Fields to update
 * @returns {Object} Result
 */
export async function updateAITool(toolId, updates) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('ai_tools')
      .update(updates)
      .eq('id', toolId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      message: 'Tool updated successfully',
      data
    }
  } catch (error) {
    console.error('Error updating AI tool:', error)
    throw error
  }
}

/**
 * Get vote statistics for a tool
 * @param {string} toolId - Tool UUID
 * @returns {Object} Stats
 */
export async function getToolVoteStats(toolId) {
  try {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('upvotes_count, downvotes_count, net_score')
      .eq('id', toolId)
      .single()

    if (error) throw error

    return data || { upvotes_count: 0, downvotes_count: 0, net_score: 0 }
  } catch (error) {
    console.error('Error fetching vote stats:', error)
    return { upvotes_count: 0, downvotes_count: 0, net_score: 0 }
  }
}
