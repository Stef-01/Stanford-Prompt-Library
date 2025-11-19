/**
 * Opportunities Service
 * API layer for opportunities CRUD operations
 */

import { supabase } from './supabase.js'

/**
 * Get all public opportunities with optional filters
 * @param {Object} options - Filter options
 * @returns {Promise<Array>} Array of opportunities
 */
export async function getOpportunities({
  category = null,
  status = null,
  limit = 50,
  featured = false
} = {}) {
  try {
    let query = supabase
      .from('opportunities')
      .select('*')
      .eq('is_public', true)
      .order('priority', { ascending: false })
      .order('posted_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (featured) {
      query = query.eq('status', 'featured')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching opportunities:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('getOpportunities error:', error)
    return []
  }
}

/**
 * Get featured opportunities (for 2x2 showcase cards)
 * @returns {Promise<Array>} Featured opportunities
 */
export async function getFeaturedOpportunities() {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'featured')
      .order('priority', { ascending: false })
      .limit(3)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getFeaturedOpportunities error:', error)
    return []
  }
}

/**
 * Get single opportunity by ID
 * @param {string} id - Opportunity ID
 * @returns {Promise<Object|null>} Opportunity object
 */
export async function getOpportunityById(id) {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .eq('is_public', true)
      .single()

    if (error) throw error

    // Increment view count
    await incrementOpportunityViews(id)

    return data
  } catch (error) {
    console.error('getOpportunityById error:', error)
    return null
  }
}

/**
 * Get opportunities by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Filtered opportunities
 */
export async function getOpportunitiesByCategory(category) {
  return getOpportunities({ category, limit: 20 })
}

/**
 * Save/unsave an opportunity (bookmark)
 * @param {string} opportunityId - Opportunity ID
 * @returns {Promise<Object>} Result with saved status
 */
export async function toggleOpportunitySave(opportunityId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if already saved
    const { data: existing } = await supabase
      .from('opportunity_saves')
      .select('id')
      .eq('user_id', user.id)
      .eq('opportunity_id', opportunityId)
      .maybeSingle()

    if (existing) {
      // Unsave
      const { error } = await supabase
        .from('opportunity_saves')
        .delete()
        .eq('id', existing.id)

      if (error) throw error
      return { saved: false, message: 'Opportunity unsaved' }
    } else {
      // Save
      const { error } = await supabase
        .from('opportunity_saves')
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId
        })

      if (error) throw error
      return { saved: true, message: 'Opportunity saved!' }
    }
  } catch (error) {
    console.error('toggleOpportunitySave error:', error)
    throw error
  }
}

/**
 * Check if user has saved an opportunity
 * @param {string} opportunityId - Opportunity ID
 * @returns {Promise<boolean>} True if saved
 */
export async function isOpportunitySaved(opportunityId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('opportunity_saves')
      .select('id')
      .eq('user_id', user.id)
      .eq('opportunity_id', opportunityId)
      .maybeSingle()

    return !!data
  } catch (error) {
    console.error('isOpportunitySaved error:', error)
    return false
  }
}

/**
 * Get user's saved opportunities
 * @returns {Promise<Array>} User's saved opportunities
 */
export async function getUserSavedOpportunities() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('opportunity_saves')
      .select(`
        id,
        created_at,
        opportunity_id,
        opportunities (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data?.map(s => s.opportunities).filter(Boolean) || []
  } catch (error) {
    console.error('getUserSavedOpportunities error:', error)
    return []
  }
}

/**
 * Get saved status for multiple opportunities at once
 * @param {Array<string>} opportunityIds - Array of opportunity IDs
 * @returns {Promise<Map>} Map of opportunityId -> boolean (saved status)
 */
export async function getBulkSaveStatus(opportunityIds) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Map()

    const { data, error } = await supabase
      .from('opportunity_saves')
      .select('opportunity_id')
      .eq('user_id', user.id)
      .in('opportunity_id', opportunityIds)

    if (error) throw error

    const saveMap = new Map()
    data?.forEach(save => {
      saveMap.set(save.opportunity_id, true)
    })

    return saveMap
  } catch (error) {
    console.error('getBulkSaveStatus error:', error)
    return new Map()
  }
}

/**
 * Track opportunity click (analytics)
 * @param {string} opportunityId - Opportunity ID
 */
export async function trackOpportunityClick(opportunityId) {
  try {
    const { error } = await supabase.rpc('increment_opportunity_clicks', {
      opp_id: opportunityId
    })

    if (error) console.error('Failed to track click:', error)
  } catch (error) {
    console.error('trackOpportunityClick error:', error)
  }
}

/**
 * Increment opportunity views
 * @param {string} opportunityId - Opportunity ID
 */
async function incrementOpportunityViews(opportunityId) {
  try {
    const { error } = await supabase.rpc('increment_opportunity_views', {
      opp_id: opportunityId
    })

    if (error) console.error('Failed to track view:', error)
  } catch (error) {
    console.error('incrementOpportunityViews error:', error)
  }
}

/**
 * Search opportunities
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Search results
 */
export async function searchOpportunities(query, limit = 20) {
  try {
    if (!query || query.trim().length === 0) {
      return []
    }

    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .textSearch('search_vector', query.trim())
      .eq('is_public', true)
      .order('priority', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('searchOpportunities error:', error)
    return []
  }
}

/**
 * Get opportunities with upcoming deadlines
 * @param {number} daysAhead - Number of days to look ahead
 * @returns {Promise<Array>} Opportunities with deadlines
 */
export async function getUpcomingDeadlines(daysAhead = 30) {
  try {
    const now = new Date()
    const future = new Date()
    future.setDate(future.getDate() + daysAhead)

    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('is_public', true)
      .gte('deadline', now.toISOString())
      .lte('deadline', future.toISOString())
      .order('deadline', { ascending: true })
      .limit(10)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getUpcomingDeadlines error:', error)
    return []
  }
}

/**
 * Get available categories
 * @returns {Array} List of categories
 */
export function getOpportunityCategories() {
  return [
    { value: 'fellowship', label: 'Fellowships', icon: 'graduation-cap' },
    { value: 'research', label: 'Research', icon: 'beaker' },
    { value: 'internship', label: 'Internships', icon: 'briefcase' },
    { value: 'teaching', label: 'Teaching', icon: 'book-open' },
    { value: 'competition', label: 'Competitions', icon: 'trophy' },
    { value: 'startup', label: 'Startups', icon: 'rocket' },
    { value: 'club', label: 'Clubs', icon: 'users-group' },
    { value: 'course', label: 'Courses', icon: 'book-open' }
  ]
}

// ==================== ADMIN FUNCTIONS ====================
// These require admin role

/**
 * Create a new opportunity (admin only)
 * @param {Object} opportunityData - Opportunity data
 * @returns {Promise<Object>} Created opportunity
 */
export async function createOpportunity(opportunityData) {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .insert(opportunityData)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('createOpportunity error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Update an opportunity (admin only)
 * @param {string} id - Opportunity ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Update result
 */
export async function updateOpportunity(id, updates) {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('updateOpportunity error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete an opportunity (admin only)
 * @param {string} id - Opportunity ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteOpportunity(id) {
  try {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('deleteOpportunity error:', error)
    return { success: false, error: error.message }
  }
}
