import { supabase } from '../config/supabase.js'
import { getCurrentUser } from './auth.js'

/**
 * Check if current user is admin
 */
export async function isAdmin() {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data?.is_admin || false
  } catch (error) {
    console.error('Check admin error:', error)
    return false
  }
}

/**
 * Get all pending prompts for admin review
 */
export async function getPendingPrompts() {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        users!inner (
          id,
          email,
          display_name,
          avatar_url
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Get pending prompts error:', error)
    throw error
  }
}

/**
 * Get all prompts (for admin view)
 */
export async function getAllPrompts(filters = {}) {
  try {
    let query = supabase
      .from('prompts')
      .select(`
        *,
        users!inner (
          id,
          email,
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Get all prompts error:', error)
    throw error
  }
}

/**
 * Approve a prompt
 */
export async function approvePrompt(promptId, makePublic = true) {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .update({
        status: 'approved',
        is_public: makePublic
      })
      .eq('id', promptId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data,
      message: 'Prompt approved successfully!'
    }
  } catch (error) {
    console.error('Approve prompt error:', error)
    throw error
  }
}

/**
 * Reject a prompt
 */
export async function rejectPrompt(promptId, reason = '') {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        is_public: false
      })
      .eq('id', promptId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data,
      message: 'Prompt rejected'
    }
  } catch (error) {
    console.error('Reject prompt error:', error)
    throw error
  }
}

/**
 * Delete a prompt (soft delete - mark as deleted)
 */
export async function deletePrompt(promptId) {
  try {
    // Instead of hard delete, mark as rejected
    const { data, error } = await supabase
      .from('prompts')
      .update({
        status: 'rejected',
        rejection_reason: 'Deleted by admin',
        is_public: false
      })
      .eq('id', promptId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data,
      message: 'Prompt deleted'
    }
  } catch (error) {
    console.error('Delete prompt error:', error)
    throw error
  }
}

/**
 * Get admin statistics
 */
export async function getAdminStats() {
  try {
    // Get counts for different statuses
    const [pending, approved, rejected, totalUsers] = await Promise.all([
      supabase
        .from('prompts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),

      supabase
        .from('prompts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved'),

      supabase
        .from('prompts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'rejected'),

      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
    ])

    return {
      pendingCount: pending.count || 0,
      approvedCount: approved.count || 0,
      rejectedCount: rejected.count || 0,
      totalUsers: totalUsers.count || 0
    }
  } catch (error) {
    console.error('Get admin stats error:', error)
    return {
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      totalUsers: 0
    }
  }
}

/**
 * Make a user admin
 */
export async function makeUserAdmin(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: true })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data,
      message: 'User is now an admin'
    }
  } catch (error) {
    console.error('Make admin error:', error)
    throw error
  }
}

/**
 * Remove admin privileges
 */
export async function removeUserAdmin(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: false })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data,
      message: 'Admin privileges removed'
    }
  } catch (error) {
    console.error('Remove admin error:', error)
    throw error
  }
}
