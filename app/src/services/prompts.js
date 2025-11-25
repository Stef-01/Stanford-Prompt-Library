import { supabase } from '../config/supabase.js'
import { getCurrentUser } from './auth.js'

/**
 * Submit a new prompt
 * Automatically marks as initial prompt if user hasn't submitted before
 */
export async function submitPrompt(promptData, imageFile = null) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    // Get user to check if this is their first prompt
    const { data: userData } = await supabase
      .from('users')
      .select('has_submitted_prompt, display_name')
      .eq('id', user.id)
      .single()

    const isInitialPrompt = !userData?.has_submitted_prompt

    // Handle image upload if provided
    let imageUrl = null
    if (imageFile) {
      try {
        // Generate unique filename
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('prompt-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Image upload error:', uploadError)
          // Don't fail the entire submission if image upload fails
          console.warn('Continuing without image due to upload error')
        } else {
          // Get public URL for the uploaded image
          const { data: { publicUrl } } = supabase.storage
            .from('prompt-images')
            .getPublicUrl(fileName)

          imageUrl = publicUrl
        }
      } catch (imgError) {
        console.error('Image processing error:', imgError)
        // Continue without image
      }
    }

    const { data, error } = await supabase
      .from('prompts')
      .insert([{
        user_id: user.id,
        title: promptData.title,
        content: promptData.content,
        description: promptData.description,
        category: promptData.category,
        tags: promptData.tags || [],
        author_name: promptData.author_name || userData?.display_name || user.email?.split('@')[0],
        is_initial_prompt: isInitialPrompt,
        status: 'pending',
        is_public: false,
        image_url: imageUrl
      }])
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      prompt: data,
      isInitialPrompt,
      message: isInitialPrompt
        ? 'Your first prompt has been submitted! It will be reviewed shortly.'
        : 'Prompt submitted successfully!'
    }

  } catch (error) {
    console.error('Submit prompt error:', error)
    throw error
  }
}

/**
 * Get all approved prompts (for approved members)
 */
export async function getApprovedPrompts(options = {}) {
  try {
    let query = supabase
      .from('prompts')
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

    const { data, error } = await query

    if (error) {
      console.error('Get prompts query error:', error)
      return [] // Return empty array instead of throwing
    }
    return data || []

  } catch (error) {
    console.error('Get prompts error:', error)
    return [] // Return empty array on any error
  }
}

/**
 * Get user's own prompts
 */
export async function getMyPrompts() {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []

  } catch (error) {
    console.error('Get my prompts error:', error)
    return []
  }
}

/**
 * Get a single prompt by ID
 */
export async function getPromptById(promptId) {
  try {
    const { data, error } = await supabase
      .from('prompts')
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

    if (error) throw error
    return data

  } catch (error) {
    console.error('Get prompt error:', error)
    throw error
  }
}

/**
 * Like a prompt
 */
export async function likePrompt(promptId) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('likes')
      .insert([{
        user_id: user.id,
        prompt_id: promptId
      }])

    if (error) {
      // If already liked (unique constraint violation), unlike instead
      if (error.code === '23505') {
        return await unlikePrompt(promptId)
      }
      throw error
    }

    return { liked: true }

  } catch (error) {
    console.error('Like prompt error:', error)
    throw error
  }
}

/**
 * Unlike a prompt
 */
export async function unlikePrompt(promptId) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('prompt_id', promptId)

    if (error) throw error

    return { liked: false }

  } catch (error) {
    console.error('Unlike prompt error:', error)
    throw error
  }
}

/**
 * Check if user has liked a prompt
 */
export async function hasLiked(promptId) {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('prompt_id', promptId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      throw error
    }

    return !!data

  } catch (error) {
    console.error('Check liked error:', error)
    return false
  }
}

/**
 * Get categories
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []

  } catch (error) {
    console.error('Get categories error:', error)
    return []
  }
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('display_name, avatar_url, total_prompts, total_likes_received')
      .eq('is_approved_member', true)
      .gt('total_prompts', 0)
      .order('total_likes_received', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []

  } catch (error) {
    console.error('Get leaderboard error:', error)
    return []
  }
}

/**
 * Get time-based leaderboard data
 * @param {string} timeFilter - 'all', 'month', or 'week'
 * @param {number} limit - Maximum number of users to return
 */
export async function getTimeBasedLeaderboard(timeFilter = 'all', limit = 10) {
  try {
    // For 'all' time, use the optimized query with aggregated counts
    if (timeFilter === 'all') {
      return await getLeaderboard(limit)
    }

    // Calculate date threshold
    const now = new Date()
    let dateThreshold

    if (timeFilter === 'week') {
      dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (timeFilter === 'month') {
      dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else {
      return await getLeaderboard(limit) // fallback to all-time
    }

    // Get prompts created within the time period
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('user_id, likes_count, users(display_name, avatar_url)')
      .eq('status', 'approved')
      .gte('created_at', dateThreshold.toISOString())

    if (promptsError) throw promptsError

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

    // Convert to array and sort by likes
    const leaderboard = Object.values(userStats)
      .sort((a, b) => b.total_likes_received - a.total_likes_received)
      .slice(0, limit)

    return leaderboard

  } catch (error) {
    console.error('Get time-based leaderboard error:', error)
    return []
  }
}

/**
 * Copy prompt to clipboard
 */
export async function copyPromptToClipboard(prompt) {
  try {
    await navigator.clipboard.writeText(prompt.content)
    return true
  } catch (error) {
    console.error('Copy to clipboard error:', error)
    return false
  }
}

/**
 * Export prompt as markdown
 */
export function exportPromptAsMarkdown(prompt) {
  const markdown = `# ${prompt.title}

${prompt.description || ''}

## Prompt

\`\`\`
${prompt.content}
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
