/**
 * Prompt Modal Component
 * Detailed view modal for prompts
 */

import { Modal } from '../ui/Modal.js'
import { getCategoryIcon, getCategoryLabel } from '../../config/constants.js'

/**
 * Create and show prompt detail modal
 * @param {Object} prompt - Prompt data
 * @param {Object} options - Modal options
 * @returns {Modal} Modal instance
 */
export function createPromptModal(prompt, options = {}) {
  const {
    onLike = null,
    onExport = null,
    onClose = null,
    canEdit = false,
    onEdit = null
  } = options

  const modalId = `prompt-modal-${prompt.id}`

  const modal = new Modal(modalId, {
    className: 'prompt-detail-modal',
    onClose
  })

  const content = renderPromptModalContent(prompt, {
    canEdit,
    onLike,
    onExport,
    onEdit
  })

  modal.create(content)

  // Attach dynamic event listeners
  attachModalListeners(modal, prompt, options)

  return modal
}

/**
 * Render modal content
 */
function renderPromptModalContent(prompt, options) {
  const { canEdit } = options

  return `
    <div class="prompt-modal-content">
      <!-- Header -->
      <div class="prompt-modal-header">
        <div class="prompt-modal-meta">
          <div class="prompt-category-badge">
            <span class="material-icons">${getCategoryIcon(prompt.category)}</span>
            <span>${getCategoryLabel(prompt.category)}</span>
          </div>
          ${prompt.is_featured ? `
            <span class="prompt-featured-badge">
              <span class="material-icons">star</span>
              Featured
            </span>
          ` : ''}
        </div>
        ${canEdit ? `
          <button class="btn btn-secondary btn-small btn-edit-prompt">
            <span class="material-icons">edit</span>
            Edit
          </button>
        ` : ''}
      </div>

      <!-- Title -->
      <h2 class="prompt-modal-title">${escapeHtml(prompt.title)}</h2>

      <!-- Description -->
      <p class="prompt-modal-description">${escapeHtml(prompt.description)}</p>

      <!-- Prompt Content -->
      <div class="prompt-modal-body">
        <h3 class="prompt-section-title">Prompt</h3>
        <div class="prompt-content-box">
          <pre class="prompt-content-text">${escapeHtml(prompt.prompt_text)}</pre>
          <button class="btn-copy-prompt" data-content="${escapeHtml(prompt.prompt_text)}" title="Copy prompt">
            <span class="material-icons">content_copy</span>
          </button>
        </div>
      </div>

      <!-- Variables (if any) -->
      ${prompt.variables && prompt.variables.length > 0 ? `
        <div class="prompt-modal-variables">
          <h3 class="prompt-section-title">Variables</h3>
          <div class="prompt-variables-list">
            ${prompt.variables.map(variable => `
              <div class="prompt-variable-item">
                <code>{${escapeHtml(variable)}}</code>
                <span class="prompt-variable-desc">Custom variable</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Example Output (if any) -->
      ${prompt.example_output ? `
        <div class="prompt-modal-example">
          <h3 class="prompt-section-title">Example Output</h3>
          <div class="prompt-example-box">
            <pre>${escapeHtml(prompt.example_output)}</pre>
          </div>
        </div>
      ` : ''}

      <!-- Stats and Actions -->
      <div class="prompt-modal-footer">
        <div class="prompt-modal-stats">
          <span class="prompt-stat">
            <span class="material-icons">favorite</span>
            <span>${prompt.likes_count || 0} likes</span>
          </span>
          <span class="prompt-stat">
            <span class="material-icons">visibility</span>
            <span>${prompt.views_count || 0} views</span>
          </span>
          ${prompt.created_at ? `
            <span class="prompt-stat">
              <span class="material-icons">schedule</span>
              <span>${formatDate(prompt.created_at)}</span>
            </span>
          ` : ''}
        </div>

        <div class="prompt-modal-actions">
          <button class="btn btn-secondary btn-like-prompt" data-prompt-id="${prompt.id}">
            <span class="material-icons">${prompt.user_has_liked ? 'favorite' : 'favorite_border'}</span>
            ${prompt.user_has_liked ? 'Liked' : 'Like'}
          </button>
          <button class="btn btn-primary btn-export-prompt">
            <span class="material-icons">download</span>
            Export
          </button>
        </div>
      </div>
    </div>
  `
}

/**
 * Attach event listeners to modal elements
 */
function attachModalListeners(modal, prompt, options) {
  const { onLike, onExport, onEdit } = options

  if (!modal.element) return

  // Copy button
  const copyBtn = modal.element.querySelector('.btn-copy-prompt')
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      copyToClipboard(prompt.prompt_text)
      showCopyFeedback(copyBtn)
    })
  }

  // Like button
  const likeBtn = modal.element.querySelector('.btn-like-prompt')
  if (likeBtn && onLike) {
    likeBtn.addEventListener('click', async () => {
      const icon = likeBtn.querySelector('.material-icons')
      const text = likeBtn.querySelector('span:last-child')

      try {
        await onLike(prompt)

        // Update UI
        const isLiked = !prompt.user_has_liked
        icon.textContent = isLiked ? 'favorite' : 'favorite_border'
        if (text) text.textContent = isLiked ? 'Liked' : 'Like'

        // Update prompt object
        prompt.user_has_liked = isLiked
      } catch (error) {
        console.error('Failed to like prompt:', error)
      }
    })
  }

  // Export button
  const exportBtn = modal.element.querySelector('.btn-export-prompt')
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (onExport) {
        onExport(prompt)
      } else {
        defaultExportPrompt(prompt)
      }
    })
  }

  // Edit button
  const editBtn = modal.element.querySelector('.btn-edit-prompt')
  if (editBtn && onEdit) {
    editBtn.addEventListener('click', () => {
      modal.close()
      onEdit(prompt)
    })
  }
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Show copy feedback
 */
function showCopyFeedback(button) {
  const originalContent = button.innerHTML
  button.innerHTML = '<span class="material-icons">check</span>'
  button.classList.add('copied')

  setTimeout(() => {
    button.innerHTML = originalContent
    button.classList.remove('copied')
  }, 2000)
}

/**
 * Default export function
 */
function defaultExportPrompt(prompt) {
  const exportData = {
    title: prompt.title,
    description: prompt.description,
    category: prompt.category,
    prompt: prompt.prompt_text,
    variables: prompt.variables || [],
    example_output: prompt.example_output || ''
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFilename(prompt.title)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Update modal like state
 * @param {Modal} modal - Modal instance
 * @param {boolean} liked - Is liked
 * @param {number} count - New likes count
 */
export function updateModalLikeState(modal, liked, count) {
  if (!modal.element) return

  const likeBtn = modal.element.querySelector('.btn-like-prompt')
  if (likeBtn) {
    const icon = likeBtn.querySelector('.material-icons')
    const text = likeBtn.childNodes[likeBtn.childNodes.length - 1]

    if (icon) icon.textContent = liked ? 'favorite' : 'favorite_border'
    if (text) text.textContent = liked ? 'Liked' : 'Like'
  }

  const likeStat = modal.element.querySelector('.prompt-modal-stats .prompt-stat:first-child span:last-child')
  if (likeStat) {
    likeStat.textContent = `${count} likes`
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

function sanitizeFilename(filename) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default { createPromptModal, updateModalLikeState }
