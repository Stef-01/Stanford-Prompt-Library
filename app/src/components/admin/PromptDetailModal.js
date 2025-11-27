/**
 * Prompt Detail Modal Component (Admin)
 * Full prompt details for admin review
 */

import { Modal } from '../ui/Modal.js'
import { getCategoryIcon, getCategoryLabel } from '../../config/constants.js'
import { formatDate, escapeHtml, getInitials } from '../../utils/helpers/formatters.js'
import { showSuccess, showError } from '../../utils/helpers/index.js'

/**
 * Create and show prompt detail modal
 * @param {Object} prompt - Prompt data
 * @param {Object} options - Modal options
 * @returns {Modal} Modal instance
 */
export function createPromptDetailModal(prompt, options = {}) {
  const {
    onApprove = null,
    onReject = null,
    onClose = null
  } = options

  const modalId = `prompt-detail-modal-${prompt.id}`

  const modal = new Modal(modalId, {
    className: 'prompt-detail-modal admin-modal',
    onClose
  })

  const content = renderPromptDetailContent(prompt, { onApprove, onReject })

  modal.create(content)

  // Attach event listeners
  attachModalListeners(modal, prompt, { onApprove, onReject })

  return modal
}

/**
 * Render prompt detail content
 */
function renderPromptDetailContent(prompt, options) {
  const { onApprove, onReject } = options

  const categoryIcon = getCategoryIcon(prompt.category)
  const categoryLabel = getCategoryLabel(prompt.category)

  return `
    <div class="prompt-detail-content">
      <!-- Header -->
      <div class="detail-header">
        <div class="detail-meta">
          <div class="category-badge">
            <span class="material-icons">${categoryIcon}</span>
            <span>${categoryLabel}</span>
          </div>
          <span class="status-badge status-${prompt.status}">
            <span class="material-icons">${getStatusIcon(prompt.status)}</span>
            ${prompt.status}
          </span>
          ${prompt.is_initial_prompt ? '<span class="first-prompt-badge">First Prompt</span>' : ''}
        </div>
      </div>

      <!-- Title -->
      <h2 class="detail-title">${escapeHtml(prompt.title)}</h2>

      <!-- Author Section -->
      <div class="detail-author-section">
        <div class="author-avatar">
          ${prompt.users?.avatar_url
            ? `<img src="${prompt.users.avatar_url}" alt="${escapeHtml(prompt.author_name)}">`
            : `<span class="avatar-placeholder">${getInitials(prompt.author_name || 'Unknown')}</span>`
          }
        </div>
        <div class="author-details">
          <div class="author-name">${escapeHtml(prompt.author_name || 'Unknown Author')}</div>
          <div class="author-email">${escapeHtml(prompt.users?.email || 'No email')}</div>
          <div class="submission-date">
            <span class="material-icons">schedule</span>
            Submitted ${formatDate(prompt.created_at, { includeTime: true })}
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="detail-section">
        <h3 class="section-title">Description</h3>
        <p class="detail-description">${escapeHtml(prompt.description)}</p>
      </div>

      <!-- Prompt Content -->
      <div class="detail-section">
        <h3 class="section-title">Prompt Content</h3>
        <div class="prompt-content-box">
          <pre class="prompt-content-text">${escapeHtml(prompt.prompt_text || prompt.content)}</pre>
          <button class="btn-copy-prompt" title="Copy prompt">
            <span class="material-icons">content_copy</span>
          </button>
        </div>
      </div>

      <!-- Variables -->
      ${prompt.variables && prompt.variables.length > 0 ? `
        <div class="detail-section">
          <h3 class="section-title">Variables</h3>
          <div class="variables-list">
            ${prompt.variables.map(variable => `
              <code class="variable-tag">{${escapeHtml(variable)}}</code>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Example Output -->
      ${prompt.example_output ? `
        <div class="detail-section">
          <h3 class="section-title">Example Output</h3>
          <div class="example-output-box">
            <pre>${escapeHtml(prompt.example_output)}</pre>
          </div>
        </div>
      ` : ''}

      <!-- Tags -->
      ${prompt.tags && prompt.tags.length > 0 ? `
        <div class="detail-section">
          <h3 class="section-title">Tags</h3>
          <div class="tags-list">
            ${prompt.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Image -->
      ${prompt.image_url ? `
        <div class="detail-section">
          <h3 class="section-title">Attached Image</h3>
          <div class="prompt-image">
            <img src="${prompt.image_url}" alt="Prompt image">
          </div>
        </div>
      ` : ''}

      <!-- Actions -->
      ${prompt.status === 'pending' && (onApprove || onReject) ? `
        <div class="detail-actions">
          <button class="btn btn-secondary btn-cancel">
            Cancel
          </button>
          ${onReject ? `
            <button class="btn btn-danger btn-reject-modal">
              <span class="material-icons">close</span>
              <span>Reject Prompt</span>
            </button>
          ` : ''}
          ${onApprove ? `
            <button class="btn btn-success btn-approve-modal">
              <span class="material-icons">check</span>
              <span>Approve Prompt</span>
            </button>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `
}

/**
 * Attach modal event listeners
 */
function attachModalListeners(modal, prompt, callbacks) {
  const { onApprove, onReject } = callbacks

  if (!modal.element) return

  // Copy button
  const copyBtn = modal.element.querySelector('.btn-copy-prompt')
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(prompt.prompt_text || prompt.content)
        copyBtn.innerHTML = '<span class="material-icons">check</span>'
        setTimeout(() => {
          copyBtn.innerHTML = '<span class="material-icons">content_copy</span>'
        }, 2000)
      } catch (error) {
        console.error('Copy failed:', error)
      }
    })
  }

  // Cancel button
  const cancelBtn = modal.element.querySelector('.btn-cancel')
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => modal.close())
  }

  // Approve button
  const approveBtn = modal.element.querySelector('.btn-approve-modal')
  if (approveBtn && onApprove) {
    approveBtn.addEventListener('click', async () => {
      approveBtn.disabled = true
      approveBtn.innerHTML = '<span class="btn-spinner"></span><span>Approving...</span>'

      try {
        await onApprove(prompt)
        showSuccess('Prompt approved successfully!')
        modal.close()
      } catch (error) {
        console.error('Approve failed:', error)
        showError('Failed to approve prompt')
        approveBtn.disabled = false
        approveBtn.innerHTML = '<span class="material-icons">check</span><span>Approve Prompt</span>'
      }
    })
  }

  // Reject button
  const rejectBtn = modal.element.querySelector('.btn-reject-modal')
  if (rejectBtn && onReject) {
    rejectBtn.addEventListener('click', async () => {
      rejectBtn.disabled = true
      rejectBtn.innerHTML = '<span class="btn-spinner"></span><span>Rejecting...</span>'

      try {
        await onReject(prompt)
        showSuccess('Prompt rejected')
        modal.close()
      } catch (error) {
        console.error('Reject failed:', error)
        showError('Failed to reject prompt')
        rejectBtn.disabled = false
        rejectBtn.innerHTML = '<span class="material-icons">close</span><span>Reject Prompt</span>'
      }
    })
  }
}

/**
 * Get status icon
 */
function getStatusIcon(status) {
  const icons = {
    pending: 'schedule',
    approved: 'check_circle',
    rejected: 'cancel'
  }
  return icons[status] || 'help'
}

export default { createPromptDetailModal }
