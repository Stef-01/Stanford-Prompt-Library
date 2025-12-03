/**
 * Prompt Review Card Component
 * Individual prompt card for admin review
 */

import { getCategoryIcon, getCategoryLabel } from '../../config/constants.js'
import { formatRelativeTime, escapeHtml, truncate, getInitials } from '../../utils/helpers/formatters.js'

/**
 * Create prompt review card
 * @param {Object} prompt - Prompt data
 * @param {Object} options - Card options
 * @returns {HTMLElement} Review card element
 */
export function createPromptReviewCard(prompt, options = {}) {
  const {
    onApprove = null,
    onReject = null,
    onViewDetails = null,
    showActions = true
  } = options

  const card = document.createElement('div')
  card.className = `prompt-review-card prompt-status-${prompt.status}`
  card.dataset.promptId = prompt.id

  const statusBadge = getStatusBadge(prompt.status)
  const categoryIcon = getCategoryIcon(prompt.category)
  const categoryLabel = getCategoryLabel(prompt.category)

  card.innerHTML = `
    <!-- Card Header -->
    <div class="review-card-header">
      <div class="review-card-meta">
        <div class="category-badge">
          <span class="material-icons">${categoryIcon}</span>
          <span>${categoryLabel}</span>
        </div>
        ${statusBadge}
      </div>
      <div class="review-card-date">
        ${formatRelativeTime(prompt.created_at)}
      </div>
    </div>

    <!-- Card Body -->
    <div class="review-card-body">
      <h3 class="review-card-title">${escapeHtml(prompt.title)}</h3>
      <p class="review-card-description">${escapeHtml(truncate(prompt.description, 200))}</p>

      <!-- Preview -->
      <div class="review-card-preview">
        <div class="preview-label">Prompt Preview:</div>
        <div class="preview-content">${escapeHtml(truncate(prompt.prompt_text || prompt.content, 300))}</div>
      </div>

      <!-- Author Info -->
      <div class="review-card-author">
        <div class="author-avatar">
          ${prompt.users?.avatar_url
            ? `<img src="${prompt.users.avatar_url}" alt="${escapeHtml(prompt.author_name)}">`
            : `<span class="avatar-placeholder">${getInitials(prompt.author_name || 'Unknown')}</span>`
          }
        </div>
        <div class="author-info">
          <div class="author-name">${escapeHtml(prompt.author_name || 'Unknown Author')}</div>
          <div class="author-email">${escapeHtml(prompt.users?.email || '')}</div>
        </div>
        ${prompt.is_initial_prompt ? '<span class="first-prompt-badge">First Prompt</span>' : ''}
      </div>
    </div>

    <!-- Card Actions -->
    ${showActions ? `
      <div class="review-card-actions">
        <button class="btn btn-ghost btn-small btn-view-details" data-prompt-id="${prompt.id}">
          <span class="material-icons">visibility</span>
          <span>View Full</span>
        </button>
        <div class="action-buttons">
          ${prompt.status === 'pending' ? `
            <button class="btn btn-danger btn-small btn-reject" data-prompt-id="${prompt.id}">
              <span class="material-icons">close</span>
              <span>Reject</span>
            </button>
            <button class="btn btn-success btn-small btn-approve" data-prompt-id="${prompt.id}">
              <span class="material-icons">check</span>
              <span>Approve</span>
            </button>
          ` : ''}
        </div>
      </div>
    ` : ''}
  `

  // Attach event listeners
  if (showActions) {
    attachCardListeners(card, prompt, { onApprove, onReject, onViewDetails })
  }

  return card
}

/**
 * Get status badge HTML
 * @param {string} status - Prompt status
 * @returns {string} Badge HTML
 */
function getStatusBadge(status) {
  const badges = {
    pending: '<span class="status-badge status-pending"><span class="material-icons">schedule</span> Pending</span>',
    approved: '<span class="status-badge status-approved"><span class="material-icons">check_circle</span> Approved</span>',
    rejected: '<span class="status-badge status-rejected"><span class="material-icons">cancel</span> Rejected</span>'
  }

  return badges[status] || ''
}

/**
 * Attach event listeners to card
 * @param {HTMLElement} card - Card element
 * @param {Object} prompt - Prompt data
 * @param {Object} callbacks - Event callbacks
 */
function attachCardListeners(card, prompt, callbacks) {
  const { onApprove, onReject, onViewDetails } = callbacks

  // View details
  if (onViewDetails) {
    const viewBtn = card.querySelector('.btn-view-details')
    if (viewBtn) {
      viewBtn.addEventListener('click', () => onViewDetails(prompt))
    }
  }

  // Approve
  if (onApprove) {
    const approveBtn = card.querySelector('.btn-approve')
    if (approveBtn) {
      approveBtn.addEventListener('click', async () => {
        approveBtn.disabled = true
        approveBtn.innerHTML = '<span class="btn-spinner"></span><span>Approving...</span>'

        try {
          await onApprove(prompt)
        } catch (error) {
          console.error('Approve failed:', error)
          approveBtn.disabled = false
          approveBtn.innerHTML = '<span class="material-icons">check</span><span>Approve</span>'
        }
      })
    }
  }

  // Reject
  if (onReject) {
    const rejectBtn = card.querySelector('.btn-reject')
    if (rejectBtn) {
      rejectBtn.addEventListener('click', async () => {
        rejectBtn.disabled = true
        rejectBtn.innerHTML = '<span class="btn-spinner"></span><span>Rejecting...</span>'

        try {
          await onReject(prompt)
        } catch (error) {
          console.error('Reject failed:', error)
          rejectBtn.disabled = false
          rejectBtn.innerHTML = '<span class="material-icons">close</span><span>Reject</span>'
        }
      })
    }
  }
}

export default { createPromptReviewCard }
