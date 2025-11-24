/**
 * Profile Window - User Profile & Stats
 * Modern monochrome design with Material Symbols Outlined icons
 */

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
    <div class="profile-window-content" style="height: 100%; overflow-y: auto; overflow-x: hidden;">
      <div style="max-width: 900px; margin: 0 auto; padding: 48px 24px 96px;">

        <!-- Hero Section -->
        <div class="text-center" style="margin-bottom: 48px; animation: fadeIn 0.4s var(--ease-spring);">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 120px; height: 120px;
                      border-radius: 50%; background: var(--white-10); border: 3px solid var(--border-subtle); margin-bottom: 24px;
                      font-size: 48px; font-weight: 700; color: var(--text-primary);">
            ${initials}
          </div>
          <h1 style="font-size: clamp(28px, 5vw, 40px); font-weight: 700; color: var(--text-primary); margin-bottom: 12px; line-height: 1.1; letter-spacing: -0.02em;">
            ${escapeHtml(userData.display_name || 'User')}
          </h1>
          <p style="font-size: 16px; color: var(--text-subtle); margin-bottom: 16px;">
            ${escapeHtml(userData.email || 'email@stanford.edu')}
          </p>

          <!-- Status Badges -->
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            ${userData.is_admin ? `
              <div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--white-5);
                   border: 1px solid var(--border-subtle); border-radius: 24px; font-size: 14px; font-weight: 500; color: var(--text-primary);">
                ${Icon({ name: 'shield', className: '!text-[18px]' })}
                <span>Admin</span>
              </div>
            ` : ''}
            ${userData.is_approved_member ? `
              <div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--white-5);
                   border: 1px solid var(--border-subtle); border-radius: 24px; font-size: 14px; font-weight: 500; color: var(--text-primary);">
                ${Icon({ name: 'check_circle', className: '!text-[18px]' })}
                <span>Approved Member</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 48px;">
          <div class="stat-card" style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; text-align: center; transition: all 0.3s var(--ease-spring);">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px;
                 border-radius: 12px; background: var(--white-10); margin-bottom: 16px;">
              ${Icon({ name: 'auto_stories', className: 'text-white !text-[28px]' })}
            </div>
            <p style="font-size: 36px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              ${userData.total_prompts || 0}
            </p>
            <p style="font-size: 14px; color: var(--text-subtle);">Prompts Created</p>
          </div>

          <div class="stat-card" style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; text-align: center; transition: all 0.3s var(--ease-spring);">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px;
                 border-radius: 12px; background: var(--white-10); margin-bottom: 16px;">
              ${Icon({ name: 'favorite', className: 'text-white !text-[28px]' })}
            </div>
            <p style="font-size: 36px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              ${userData.total_likes_received || 0}
            </p>
            <p style="font-size: 14px; color: var(--text-subtle);">Total Likes</p>
          </div>

          <div class="stat-card" style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; text-align: center; transition: all 0.3s var(--ease-spring);">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px;
                 border-radius: 12px; background: var(--white-10); margin-bottom: 16px;">
              ${Icon({ name: 'event', className: 'text-white !text-[28px]' })}
            </div>
            <p style="font-size: 36px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              ${memberSince}
            </p>
            <p style="font-size: 14px; color: var(--text-subtle);">Member Since</p>
          </div>
        </div>

        <!-- Recent Activity -->
        <div style="margin-bottom: 32px;">
          <h3 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            ${Icon({ name: 'history', className: '!text-[24px]' })}
            <span>Recent Activity</span>
          </h3>
          <div style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 20px;">
            ${userData.has_submitted_prompt ? `
              <div class="activity-item" style="padding: 16px; background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 12px; margin-bottom: 12px; transition: all 0.2s;">
                <div style="display: flex; align-items: start; gap: 12px;">
                  <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;
                       border-radius: 10px; background: var(--white-10); flex-shrink: 0;">
                    ${Icon({ name: 'check_circle', className: 'text-white !text-[24px]' })}
                  </div>
                  <div style="flex: 1;">
                    <p style="font-size: 15px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px;">
                      Submitted your first prompt
                    </p>
                    <p style="font-size: 13px; color: var(--text-subtle);">
                      Welcome to the community!
                    </p>
                  </div>
                </div>
              </div>
            ` : ''}

            ${userData.is_approved_member ? `
              <div class="activity-item" style="padding: 16px; background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 12px; transition: all 0.2s;">
                <div style="display: flex; align-items: start; gap: 12px;">
                  <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;
                       border-radius: 10px; background: var(--white-10); flex-shrink: 0;">
                    ${Icon({ name: 'celebration', className: 'text-white !text-[24px]' })}
                  </div>
                  <div style="flex: 1;">
                    <p style="font-size: 15px; font-weight: 500; color: var(--text-primary); margin-bottom: 4px;">
                      Became an approved member
                    </p>
                    <p style="font-size: 13px; color: var(--text-subtle);">
                      You now have full access to the library
                    </p>
                  </div>
                </div>
              </div>
            ` : `
              <div style="padding: 40px; text-align: center;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px;
                     border-radius: 12px; background: var(--white-5); border: 1px solid var(--border-subtle); margin-bottom: 16px;">
                  ${Icon({ name: 'inbox', className: 'text-subtle-white !text-[32px]' })}
                </div>
                <p style="font-size: 16px; color: var(--text-subtle); margin-bottom: 8px;">No activity yet</p>
                <p style="font-size: 14px; color: var(--text-subtle);">Start by submitting your first prompt!</p>
              </div>
            `}
          </div>
        </div>

        <!-- Account Information -->
        <div>
          <h3 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            ${Icon({ name: 'badge', className: '!text-[24px]' })}
            <span>Account Information</span>
          </h3>
          <div style="background: var(--white-5); border: 1px solid var(--border-subtle); border-radius: 16px; overflow: hidden;">
            <div class="info-row" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--white-5); transition: background 0.2s;">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${Icon({ name: 'verified_user', className: 'text-subtle-white !text-[20px]' })}
                <span style="font-size: 14px; color: var(--text-subtle);">Account Status</span>
              </div>
              <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">
                ${userData.is_approved_member ? 'Active' : 'Pending'}
              </span>
            </div>

            <div class="info-row" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--white-5); transition: background 0.2s;">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${Icon({ name: 'description', className: 'text-subtle-white !text-[20px]' })}
                <span style="font-size: 14px; color: var(--text-subtle);">Submitted Prompts</span>
              </div>
              <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">
                ${userData.has_submitted_prompt ? 'Yes' : 'No'}
              </span>
            </div>

            <div class="info-row" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; transition: background 0.2s;">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${Icon({ name: 'fingerprint', className: 'text-subtle-white !text-[20px]' })}
                <span style="font-size: 14px; color: var(--text-subtle);">User ID</span>
              </div>
              <span style="font-size: 13px; font-family: 'Courier New', monospace; color: var(--text-subtle);">
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

  // Add hover effects
  const statCards = contentContainer.querySelectorAll('.stat-card')
  statCards.forEach(card => {
    card.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.background = 'var(--white-8)'
      e.currentTarget.style.borderColor = 'var(--white-20)'
      e.currentTarget.style.transform = 'translateY(-4px)'
    })
    card.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.background = 'var(--white-5)'
      e.currentTarget.style.borderColor = 'var(--border-subtle)'
      e.currentTarget.style.transform = 'translateY(0)'
    })
  })

  const activityItems = contentContainer.querySelectorAll('.activity-item')
  activityItems.forEach(item => {
    item.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.background = 'var(--white-8)'
      e.currentTarget.style.borderColor = 'var(--white-20)'
    })
    item.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.background = 'var(--white-5)'
      e.currentTarget.style.borderColor = 'var(--border-subtle)'
    })
  })

  const infoRows = contentContainer.querySelectorAll('.info-row')
  infoRows.forEach(row => {
    row.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.background = 'var(--white-5)'
    })
    row.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.background = 'transparent'
    })
  })
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
