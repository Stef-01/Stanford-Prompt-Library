/**
 * Admin Service (Refactored)
 * Uses BaseService for standardized error handling and caching
 */

import { BaseService, AuthenticationError } from './base-service.js'
import { supabase } from '../config/supabase.js'
import { getCurrentUser } from './auth.js'
import { CACHE_TTL } from '../config/constants.js'

// ============================================================================
// Admin Service Class
// ============================================================================

class AdminService extends BaseService {
  constructor() {
    super('users', {
      cacheTTL: CACHE_TTL.SHORT, // Admin data needs fresher cache
      enableMetrics: true
    })
  }

  /**
   * Check if current user is admin
   */
  async isAdmin() {
    try {
      const user = await getCurrentUser()
      if (!user) return false

      const cacheKey = `is_admin:${user.id}`

      const data = await this.getCached(cacheKey, async () => {
        return this.executeQuery(() =>
          supabase
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single()
        )
      }, CACHE_TTL.SHORT)

      return data?.is_admin || false
    } catch (error) {
      console.error('Check admin error:', error)
      return false
    }
  }

  /**
   * Get all pending prompts for admin review
   */
  async getPendingPrompts() {
    return this.getCached('pending_prompts', async () => {
      return this.executeQuery(() =>
        supabase
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
      )
    }, CACHE_TTL.SHORT)
  }

  /**
   * Get all prompts with optional filters
   */
  async getAllPrompts(filters = {}) {
    const cacheKey = `all_prompts:${JSON.stringify(filters)}`

    return this.getCached(cacheKey, async () => {
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

      return this.executeQuery(() => query)
    }, CACHE_TTL.SHORT)
  }

  /**
   * Approve a prompt
   */
  async approvePrompt(promptId, makePublic = true) {
    const data = await this.executeQuery(() =>
      supabase
        .from('prompts')
        .update({
          status: 'approved',
          is_public: makePublic
        })
        .eq('id', promptId)
        .select()
        .single()
    )

    // Invalidate relevant caches
    this.invalidateCache('pending_prompts')
    this.invalidateCache('all_prompts')
    this.invalidateCache('admin_stats')

    return {
      success: true,
      data,
      message: 'Prompt approved successfully!'
    }
  }

  /**
   * Reject a prompt
   */
  async rejectPrompt(promptId, reason = '') {
    const data = await this.executeQuery(() =>
      supabase
        .from('prompts')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          is_public: false
        })
        .eq('id', promptId)
        .select()
        .single()
    )

    // Invalidate relevant caches
    this.invalidateCache('pending_prompts')
    this.invalidateCache('all_prompts')
    this.invalidateCache('admin_stats')

    return {
      success: true,
      data,
      message: 'Prompt rejected'
    }
  }

  /**
   * Delete a prompt (soft delete)
   */
  async deletePrompt(promptId) {
    const data = await this.executeQuery(() =>
      supabase
        .from('prompts')
        .update({
          status: 'rejected',
          rejection_reason: 'Deleted by admin',
          is_public: false
        })
        .eq('id', promptId)
        .select()
        .single()
    )

    // Invalidate relevant caches
    this.invalidateCache('pending_prompts')
    this.invalidateCache('all_prompts')
    this.invalidateCache('admin_stats')

    return {
      success: true,
      data,
      message: 'Prompt deleted'
    }
  }

  /**
   * Get admin statistics
   */
  async getAdminStats() {
    return this.getCached('admin_stats', async () => {
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
    }, CACHE_TTL.SHORT)
  }

  /**
   * Make a user admin
   */
  async makeUserAdmin(userId) {
    const data = await this.executeQuery(() =>
      supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', userId)
        .select()
        .single()
    )

    // Invalidate cache
    this.invalidateCache(`is_admin:${userId}`)

    return {
      success: true,
      data,
      message: 'User is now an admin'
    }
  }

  /**
   * Remove admin privileges
   */
  async removeUserAdmin(userId) {
    const data = await this.executeQuery(() =>
      supabase
        .from('users')
        .update({ is_admin: false })
        .eq('id', userId)
        .select()
        .single()
    )

    // Invalidate cache
    this.invalidateCache(`is_admin:${userId}`)

    return {
      success: true,
      data,
      message: 'Admin privileges removed'
    }
  }
}

// ============================================================================
// Export singleton instance and convenience functions
// ============================================================================

export const adminService = new AdminService()

// Export convenience functions that delegate to the service
export const isAdmin = () => adminService.isAdmin()
export const getPendingPrompts = () => adminService.getPendingPrompts()
export const getAllPrompts = (filters) => adminService.getAllPrompts(filters)
export const approvePrompt = (id, makePublic) => adminService.approvePrompt(id, makePublic)
export const rejectPrompt = (id, reason) => adminService.rejectPrompt(id, reason)
export const deletePrompt = (id) => adminService.deletePrompt(id)
export const getAdminStats = () => adminService.getAdminStats()
export const makeUserAdmin = (id) => adminService.makeUserAdmin(id)
export const removeUserAdmin = (id) => adminService.removeUserAdmin(id)

export default adminService
