import { getMyPrompts, exportPromptAsMarkdown } from '../../services/prompts.js'

let myPrompts = []

/**
 * Render Library Window Content
 * Shows the user's submitted prompts
 * @param {HTMLElement} contentContainer - Window content container
 * @param {Object} userData - User data
 */
export async function renderLibraryWindow(contentContainer, userData) {
  // Load user's prompts
  myPrompts = await getMyPrompts()

  contentContainer.innerHTML = `
    <div style="padding: 20px;">
      <!-- Header -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 24px; margin-bottom: 10px; color: var(--text-primary);">📚 My Library</h2>
        <p style="color: var(--text-secondary);">Your submitted prompts and their status</p>
      </div>

      <!-- Stats Summary -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-bottom: 30px;">
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; text-align: center;">
          <p style="font-size: 24px; font-weight: 600; color: var(--accent-blue);">${myPrompts.length}</p>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">Total Prompts</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; text-align: center;">
          <p style="font-size: 24px; font-weight: 600; color: var(--accent-green);">${myPrompts.filter(p => p.status === 'approved').length}</p>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">Approved</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; text-align: center;">
          <p style="font-size: 24px; font-weight: 600; color: var(--accent-yellow);">${myPrompts.filter(p => p.status === 'pending').length}</p>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">Pending</p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; text-align: center;">
          <p style="font-size: 24px; font-weight: 600; color: var(--accent-red);">${myPrompts.filter(p => p.status === 'rejected').length}</p>
          <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">Rejected</p>
        </div>
      </div>

      <!-- Prompts List -->
      <div id="my-prompts-list">
        ${renderMyPromptsList()}
      </div>
    </div>
  `

  // Attach event listeners
  setupLibraryEventListeners(contentContainer)
}

/**
 * Render user's prompts list
 */
function renderMyPromptsList() {
  if (myPrompts.length === 0) {
    return `
      <div style="text-align: center; padding: 60px 20px; background: rgba(255, 255, 255, 0.03); border-radius: 12px;">
        <p style="font-size: 48px; margin-bottom: 15px;">📝</p>
        <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No prompts yet</h3>
        <p style="color: var(--text-secondary); font-size: 14px;">Submit your first prompt to get started!</p>
      </div>
    `
  }

  return myPrompts.map(prompt => {
    const statusColors = {
      pending: 'var(--accent-yellow)',
      approved: 'var(--accent-green)',
      rejected: 'var(--accent-red)'
    }

    const statusIcons = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌'
    }

    return `
      <div class="my-prompt-card" data-id="${prompt.id}" style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 15px; border-left: 4px solid ${statusColors[prompt.status] || 'var(--border-color)'};">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
          <div style="flex: 1;">
            <h3 style="font-size: 18px; margin-bottom: 8px; color: var(--text-primary);">${escapeHtml(prompt.title)}</h3>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <span style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; background: rgba(255, 255, 255, 0.1); border-radius: 12px; font-size: 12px; font-weight: 600; color: ${statusColors[prompt.status]};">
                ${statusIcons[prompt.status]} ${prompt.status.charAt(0).toUpperCase() + prompt.status.slice(1)}
              </span>
              <span style="padding: 4px 12px; background: rgba(255, 255, 255, 0.05); border-radius: 12px; font-size: 12px; color: var(--text-secondary);">
                ${prompt.category}
              </span>
              <span style="font-size: 12px; color: var(--text-secondary);">
                📅 ${formatDate(prompt.created_at)}
              </span>
            </div>
          </div>
          <button class="export-btn" data-id="${prompt.id}" title="Export as markdown" style="background: rgba(255, 255, 255, 0.1); border: none; border-radius: 6px; padding: 8px 12px; cursor: pointer; color: var(--text-primary); font-size: 14px;">
            ⬇️
          </button>
        </div>

        <!-- Description -->
        ${prompt.description ? `
          <p style="color: var(--text-secondary); margin-bottom: 15px; font-size: 14px; line-height: 1.5;">
            ${escapeHtml(prompt.description)}
          </p>
        ` : ''}

        <!-- Tags -->
        ${prompt.tags && prompt.tags.length > 0 ? `
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 15px;">
            ${prompt.tags.map(tag => `
              <span style="padding: 3px 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; font-size: 11px; color: var(--text-secondary);">
                ${escapeHtml(tag)}
              </span>
            `).join('')}
          </div>
        ` : ''}

        <!-- Content Preview -->
        <div style="background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 12px; margin-bottom: 15px;">
          <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; text-transform: uppercase; font-weight: 600;">Prompt Content</div>
          <pre style="font-size: 13px; line-height: 1.5; color: var(--text-primary); white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; max-height: 150px; overflow-y: auto; margin: 0;">${escapeHtml(prompt.content.substring(0, 300))}${prompt.content.length > 300 ? '...' : ''}</pre>
        </div>

        <!-- Rejection Reason (if rejected) -->
        ${prompt.status === 'rejected' && prompt.rejection_reason ? `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--accent-red); border-radius: 8px; padding: 12px; margin-bottom: 15px;">
            <div style="font-size: 11px; color: var(--accent-red); margin-bottom: 5px; text-transform: uppercase; font-weight: 600;">❌ Rejection Reason</div>
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">${escapeHtml(prompt.rejection_reason)}</p>
          </div>
        ` : ''}

        <!-- Stats -->
        <div style="display: flex; gap: 20px; font-size: 13px; color: var(--text-secondary);">
          ${prompt.status === 'approved' ? `
            <span>❤️ ${prompt.likes_count || 0} likes</span>
          ` : ''}
          ${prompt.is_initial_prompt ? '<span style="color: var(--accent-purple);">⭐ Initial Prompt</span>' : ''}
        </div>
      </div>
    `
  }).join('')
}

/**
 * Set up event listeners
 */
function setupLibraryEventListeners(contentContainer) {
  // Export buttons
  const exportBtns = contentContainer.querySelectorAll('.export-btn')
  exportBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const promptId = btn.dataset.id
      const prompt = myPrompts.find(p => p.id === promptId)
      if (prompt) {
        await exportPromptAsMarkdown(prompt)
      }
    })
  })
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return 'Recently'

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 1) {
    return 'Today'
  } else if (diffDays < 2) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months !== 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
