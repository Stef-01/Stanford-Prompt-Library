/**
 * Profile Window - User Profile & Stats
 * Modern monochrome design with Material Symbols Outlined icons
 */

import './profile-window.css'
import { Icon } from '../ui/Icon.js'

/**
 * Render Profile Window Content
 * @param {HTMLElement} contentContainer - Window content container
 * @param {Object} userData - User data
 */
export async function renderProfileWindow(contentContainer, userData) {
  const initials = getInitials(userData.display_name || 'User')
  const memberSince = formatDate(userData.created_at)

  contentContainer.innerHTML = `
    <div class="profile-window-content">
      <div class="profile-window-inner">

        <!-- Hero Section -->
        <div class="profile-hero">
          <div class="profile-avatar">
            ${initials}
          </div>
          <h1 class="profile-name">
            ${escapeHtml(userData.display_name || 'User')}
          </h1>
          <p class="profile-email">
            ${escapeHtml(userData.email || 'email@stanford.edu')}
          </p>

          <!-- Status Badges -->
          <div class="profile-badges">
            ${userData.is_admin ? `
              <div class="profile-badge">
                ${Icon({ name: 'shield', className: '!text-[18px]' })}
                <span>Admin</span>
              </div>
            ` : ''}
            ${userData.is_approved_member ? `
              <div class="profile-badge">
                ${Icon({ name: 'check_circle', className: '!text-[18px]' })}
                <span>Approved Member</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="profile-stats-grid">
          <div class="profile-stat-card">
            <div class="profile-stat-icon">
              ${Icon({ name: 'auto_stories', className: 'text-white !text-[28px]' })}
            </div>
            <p class="profile-stat-value">
              ${userData.total_prompts || 0}
            </p>
            <p class="profile-stat-label">Prompts Created</p>
          </div>

          <div class="profile-stat-card">
            <div class="profile-stat-icon">
              ${Icon({ name: 'favorite', className: 'text-white !text-[28px]' })}
            </div>
            <p class="profile-stat-value">
              ${userData.total_likes_received || 0}
            </p>
            <p class="profile-stat-label">Total Likes</p>
          </div>

          <div class="profile-stat-card">
            <div class="profile-stat-icon">
              ${Icon({ name: 'event', className: 'text-white !text-[28px]' })}
            </div>
            <p class="profile-stat-value">
              ${memberSince}
            </p>
            <p class="profile-stat-label">Member Since</p>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="profile-activity-section">
          <h3 class="profile-section-title">
            ${Icon({ name: 'history', className: '!text-[24px]' })}
            <span>Recent Activity</span>
          </h3>
          <div class="profile-activity-container">
            ${userData.has_submitted_prompt ? `
              <div class="profile-activity-item">
                <div class="profile-activity-content">
                  <div class="profile-activity-icon">
                    ${Icon({ name: 'check_circle', className: 'text-white !text-[24px]' })}
                  </div>
                  <div class="profile-activity-text">
                    <p class="profile-activity-title">
                      Submitted your first prompt
                    </p>
                    <p class="profile-activity-description">
                      Welcome to the community!
                    </p>
                  </div>
                </div>
              </div>
            ` : ''}

            ${userData.is_approved_member ? `
              <div class="profile-activity-item">
                <div class="profile-activity-content">
                  <div class="profile-activity-icon">
                    ${Icon({ name: 'celebration', className: 'text-white !text-[24px]' })}
                  </div>
                  <div class="profile-activity-text">
                    <p class="profile-activity-title">
                      Became an approved member
                    </p>
                    <p class="profile-activity-description">
                      You now have full access to the library
                    </p>
                  </div>
                </div>
              </div>
            ` : `
              <div class="profile-empty-activity">
                <div class="profile-empty-icon-container">
                  ${Icon({ name: 'inbox', className: 'text-subtle-white !text-[32px]' })}
                </div>
                <p class="profile-empty-title">No activity yet</p>
                <p class="profile-empty-description">Start by submitting your first prompt!</p>
              </div>
            `}
          </div>
        </div>

        <!-- Account Information -->
        <div class="profile-account-section">
          <h3 class="profile-section-title">
            ${Icon({ name: 'badge', className: '!text-[24px]' })}
            <span>Account Information</span>
          </h3>
          <div class="profile-info-container">
            <div class="profile-info-row">
              <div class="profile-info-label">
                ${Icon({ name: 'verified_user', className: 'text-subtle-white !text-[20px]' })}
                <span class="profile-info-label-text">Account Status</span>
              </div>
              <span class="profile-info-value">
                ${userData.is_approved_member ? 'Active' : 'Pending'}
              </span>
            </div>

            <div class="profile-info-row">
              <div class="profile-info-label">
                ${Icon({ name: 'description', className: 'text-subtle-white !text-[20px]' })}
                <span class="profile-info-label-text">Submitted Prompts</span>
              </div>
              <span class="profile-info-value">
                ${userData.has_submitted_prompt ? 'Yes' : 'No'}
              </span>
            </div>

            <div class="profile-info-row">
              <div class="profile-info-label">
                ${Icon({ name: 'fingerprint', className: 'text-subtle-white !text-[20px]' })}
                <span class="profile-info-label-text">User ID</span>
              </div>
              <span class="profile-info-value-mono">
                ${userData.id.substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `

  // Inject custom styles
  injectStyles()

  // Add hover effects are now handled by CSS :hover pseudo-class
  // No JavaScript hover manipulation needed
}

/**
 * Get initials from name
 */
function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
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

  if (diffDays < 30) {
    return `${diffDays}d ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months}mo ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
}

/**
 * Inject custom styles for profile window
 */
function injectStyles() {
  if (document.getElementById('profile-window-styles')) return

  const style = document.createElement('style')
  style.id = 'profile-window-styles'
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `
  document.head.appendChild(style)
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
