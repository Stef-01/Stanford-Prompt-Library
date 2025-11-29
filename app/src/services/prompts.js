/**
 * Prompts Service (Refactored)
 * Uses BaseService for standardized error handling and caching
 */

import { BaseService, AuthenticationError, ValidationError } from './base-service.js'
import { supabase } from '../config/supabase.js'
import { getCurrentUser } from './auth.js'
import { CACHE_TTL, validatePrompt } from '../config/constants.js'

// ============================================================================
// Prompts Service Class
// ============================================================================

export class PromptsService extends BaseService {
  constructor() {
    super('prompts', {
      cacheTTL: CACHE_TTL.MEDIUM,
      enableMetrics: true
    })
  }

  /**
   * Submit a new prompt
   */
  async submitPrompt(promptData, imageFile = null) {
    const user = await getCurrentUser()
    if (!user) throw new AuthenticationError()

    // Validate prompt data
    const validation = validatePrompt(promptData)
    if (!validation.valid) {
      throw new ValidationError('Invalid prompt data', validation.errors)
    }

    // Get user to check if this is their first prompt
    const userData = await this.executeQuery(() =>
      supabase
        .from('users')
        .select('has_submitted_prompt, display_name')
        .eq('id', user.id)
        .single()
    )

    const isInitialPrompt = !userData?.has_submitted_prompt

    // Handle image upload if provided
    let imageUrl = null
    if (imageFile) {
      imageUrl = await this.uploadPromptImage(imageFile, user.id)
    }

    // Insert prompt
    const data = await this.executeMutation(
      () => supabase
        .from(this.tableName)
        .insert([{
          user_id: user.id,
          title: promptData.title,
          prompt_text: promptData.prompt_text || promptData.content,
          description: promptData.description,
          category: promptData.category,
          tags: promptData.tags || [],
          author_name: promptData.author_name || userData?.display_name || user.email?.split('@')[0],
          is_initial_prompt: isInitialPrompt,
          status: 'pending',
          is_public: false,
          image_url: imageUrl,
          variables: promptData.variables || [],
          example_output: promptData.example_output || null
        }])
        .select()
        .single(),
      ['approved', `user:${user.id}`]
    )

    return {
      success: true,
      prompt: data,
      isInitialPrompt,
      message: isInitialPrompt
        ? 'Your first prompt has been submitted! It will be reviewed shortly.'
        : 'Prompt submitted successfully!'
    }
  }

  /**
   * Get all approved prompts
   */
  async getApprovedPrompts(options = {}) {
    return this.getCached('approved', async () => {
      return this.dedupedRequest('approved-prompts', async () => {
        let query = supabase
          .from(this.tableName)
          .select(`
            *,
            users!inner (
              display_name,
              avatar_url
            )
          `)
          .eq('is_public', true)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })

        // Apply filters
        if (options.category) {
          query = query.eq('category', options.category)
        }

        if (options.tags && options.tags.length > 0) {
          query = query.contains('tags', options.tags)
        }

        if (options.search) {
          query = query.textSearch('search_vector', options.search)
        }

        // Apply sorting
        if (options.sortBy === 'likes') {
          query = query.order('likes_count', { ascending: false })
        } else if (options.sortBy === 'oldest') {
          query = query.order('created_at', { ascending: true })
        }

        // Pagination
        if (options.limit) {
          query = query.limit(options.limit)
        }

        return await this.executeQuery(() => query)
      })
    }, CACHE_TTL.MEDIUM)
  }

  /**
   * Get user's own prompts
   */
  async getMyPrompts() {
    const user = await getCurrentUser()
    if (!user) return []

    return this.getCached(`user:${user.id}`, async () => {
      return this.executeQuery(() =>
        supabase
          .from(this.tableName)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      )
    }, CACHE_TTL.SHORT)
  }

  /**
   * Get a single prompt by ID
   */
  async getPromptById(promptId) {
    return this.getCached(`prompt:${promptId}`, async () => {
      return this.executeQuery(() =>
        supabase
          .from(this.tableName)
          .select(`
            *,
            users!inner (
              display_name,
              avatar_url,
              email
            )
          `)
          .eq('id', promptId)
          .single()
      )
    }, CACHE_TTL.LONG)
  }

  /**
   * Like a prompt (toggle)
   */
  async likePrompt(promptId) {
    const user = await getCurrentUser()
    if (!user) throw new AuthenticationError()

    try {
      // Try to insert like
      await this.executeQuery(() =>
        supabase
          .from('likes')
          .insert([{
            user_id: user.id,
            prompt_id: promptId
          }])
      )

      // Invalidate relevant caches
      this.invalidateCache()

      return { liked: true }
    } catch (error) {
      // If already liked (unique constraint), unlike instead
      if (error.code === '23505') {
        return await this.unlikePrompt(promptId)
      }
      throw error
    }
  }

  /**
   * Unlike a prompt
   */
  async unlikePrompt(promptId) {
    const user = await getCurrentUser()
    if (!user) throw new AuthenticationError()

    await this.executeQuery(() =>
      supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)
    )

    // Invalidate relevant caches
    this.invalidateCache()

    return { liked: false }
  }

  /**
   * Check if user has liked a prompt
   */
  async hasLiked(promptId) {
    const user = await getCurrentUser()
    if (!user) return false

    try {
      const data = await this.executeQuery(() =>
        supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('prompt_id', promptId)
          .single()
      )

      return !!data
    } catch (error) {
      if (error.code === 'PGRST116') {
        return false // No rows found
      }
      throw error
    }
  }

  /**
   * Get categories
   */
  async getCategories() {
    return this.getCached('categories', async () => {
      return this.executeQuery(() =>
        supabase
          .from('categories')
          .select('*')
          .order('name')
      )
    }, CACHE_TTL.LONG)
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(limit = 10) {
    return this.getCached(`leaderboard:${limit}`, async () => {
      return this.executeQuery(() =>
        supabase
          .from('users')
          .select('display_name, avatar_url, total_prompts, total_likes_received')
          .eq('is_approved_member', true)
          .gt('total_prompts', 0)
          .order('total_likes_received', { ascending: false })
          .limit(limit)
      )
    }, CACHE_TTL.MEDIUM)
  }

  /**
   * Get time-based leaderboard data
   */
  async getTimeBasedLeaderboard(timeFilter = 'all', limit = 10) {
    return this.getCached(`leaderboard:${timeFilter}:${limit}`, async () => {
      // For 'all' time, use the optimized query
      if (timeFilter === 'all') {
        return await this.getLeaderboard(limit)
      }

      // Calculate date threshold
      const now = new Date()
      let dateThreshold

      if (timeFilter === 'week') {
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (timeFilter === 'month') {
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      } else {
        return await this.getLeaderboard(limit)
      }

      // Get prompts within time period
      const prompts = await this.executeQuery(() =>
        supabase
          .from(this.tableName)
          .select('user_id, likes_count, users(display_name, avatar_url)')
          .eq('status', 'approved')
          .gte('created_at', dateThreshold.toISOString())
      )

      // Aggregate data by user
      const userStats = {}

      prompts.forEach(prompt => {
        const userId = prompt.user_id
        if (!userStats[userId]) {
          userStats[userId] = {
            display_name: prompt.users?.display_name || 'Unknown',
            avatar_url: prompt.users?.avatar_url || null,
            total_prompts: 0,
            total_likes_received: 0
          }
        }
        userStats[userId].total_prompts += 1
        userStats[userId].total_likes_received += prompt.likes_count || 0
      })

      // Convert to array and sort
      return Object.values(userStats)
        .sort((a, b) => b.total_likes_received - a.total_likes_received)
        .slice(0, limit)
    }, CACHE_TTL.SHORT)
  }

  /**
   * Upload prompt image to storage
   */
  async uploadPromptImage(imageFile, userId) {
    try {
      // Generate unique filename
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('prompt-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Image upload error:', uploadError)
        return null
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('prompt-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Image processing error:', error)
      return null
    }
  }

  /**
   * Copy prompt to clipboard
   */
  async copyToClipboard(promptText) {
    try {
      await navigator.clipboard.writeText(promptText)
      return true
    } catch (error) {
      console.error('Copy to clipboard error:', error)
      return false
    }
  }

  /**
   * Export prompt as markdown
   */
  exportAsMarkdown(prompt) {
    const markdown = `# ${prompt.title}

${prompt.description || ''}

## Prompt

\`\`\`
${prompt.prompt_text || prompt.content}
\`\`\`

## Tags

${prompt.tags?.join(', ') || 'None'}

## Category

${prompt.category}

---

*From Stanford Prompt Library*
`

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${prompt.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }
}

// ============================================================================
// Service Instance
// ============================================================================

export const promptsService = new PromptsService()

// ============================================================================
// Convenience Exports (backward compatibility)
// ============================================================================

export const submitPrompt = (data, image) => promptsService.submitPrompt(data, image)
export const getApprovedPrompts = (options) => promptsService.getApprovedPrompts(options)
export const getMyPrompts = () => promptsService.getMyPrompts()
export const getPromptById = (id) => promptsService.getPromptById(id)
export const likePrompt = (id) => promptsService.likePrompt(id)
export const unlikePrompt = (id) => promptsService.unlikePrompt(id)
export const hasLiked = (id) => promptsService.hasLiked(id)
export const getCategories = () => promptsService.getCategories()
export const getLeaderboard = (limit) => promptsService.getLeaderboard(limit)
export const getTimeBasedLeaderboard = (filter, limit) => promptsService.getTimeBasedLeaderboard(filter, limit)
export const copyPromptToClipboard = (prompt) => promptsService.copyToClipboard(prompt.prompt_text || prompt.content)
export const exportPromptAsMarkdown = (prompt) => promptsService.exportAsMarkdown(prompt)

export default promptsService
