/**
 * Render Profile Window Content
 * @param {HTMLElement} contentContainer - Window content container
 * @param {Object} userData - User data
 */
export async function renderProfileWindow(contentContainer, userData) {
  const initials = getInitials(userData.display_name || 'User')
  const memberSince = formatDate(userData.created_at)

  contentContainer.innerHTML = `
    <!-- Profile Header -->
    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color);">
      <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 600;">
        ${initials}
      </div>
      <div>
        <h2 style="font-size: 24px; margin-bottom: 5px;">${escapeHtml(userData.display_name || 'User')}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 5px;">${escapeHtml(userData.email || 'email@stanford.edu')}</p>
        ${userData.is_admin ? '<p style="color: var(--accent-purple); font-size: 14px; font-weight: 600;">🛡️ Admin</p>' : ''}
        ${userData.is_approved_member ? '<p style="color: var(--accent-green); font-size: 14px; font-weight: 600;">✓ Approved Member</p>' : ''}
      </div>
    </div>

    <!-- Stats Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;">
      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; text-align: center;">
        <p style="font-size: 24px; font-weight: 600; color: var(--accent-blue);">${userData.total_prompts || 0}</p>
        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">Prompts Created</p>
      </div>
      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; text-align: center;">
        <p style="font-size: 24px; font-weight: 600; color: var(--accent-green);">${userData.total_likes_received || 0}</p>
        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">Total Likes</p>
      </div>
      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; text-align: center;">
        <p style="font-size: 24px; font-weight: 600; color: var(--accent-purple);">${memberSince}</p>
        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">Member Since</p>
      </div>
    </div>

    <!-- Recent Activity -->
    <h3 style="margin-bottom: 15px; color: var(--text-primary);">Recent Activity</h3>
    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px;">
      ${userData.has_submitted_prompt ? `
        <div style="padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 6px; margin-bottom: 10px;">
          <p style="font-size: 13px;">
            <span style="color: var(--accent-green);">✓</span>
            Submitted your first prompt
          </p>
          <p style="font-size: 11px; color: var(--text-secondary); margin-top: 5px;">Welcome to the community!</p>
        </div>
      ` : ''}

      ${userData.is_approved_member ? `
        <div style="padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 6px;">
          <p style="font-size: 13px;">
            <span style="color: var(--accent-blue);">🎉</span>
            Became an approved member
          </p>
          <p style="font-size: 11px; color: var(--text-secondary); margin-top: 5px;">You now have full access to the library</p>
        </div>
      ` : `
        <div style="padding: 10px; background: rgba(255, 255, 255, 0.03); border-radius: 6px; text-align: center;">
          <p style="font-size: 13px; color: var(--text-secondary);">No activity yet</p>
          <p style="font-size: 11px; color: var(--text-secondary); margin-top: 5px;">Start by submitting your first prompt!</p>
        </div>
      `}
    </div>

    <!-- Account Info -->
    <h3 style="margin-top: 30px; margin-bottom: 15px; color: var(--text-primary);">Account Information</h3>
    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px;">
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
        <span style="font-size: 13px; color: var(--text-secondary);">Account Status</span>
        <span style="font-size: 13px; font-weight: 500; color: var(--accent-green);">
          ${userData.is_approved_member ? 'Active' : 'Pending'}
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
        <span style="font-size: 13px; color: var(--text-secondary);">Submitted Prompts</span>
        <span style="font-size: 13px; font-weight: 500;">
          ${userData.has_submitted_prompt ? 'Yes' : 'No'}
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 10px 0;">
        <span style="font-size: 13px; color: var(--text-secondary);">User ID</span>
        <span style="font-size: 11px; font-family: monospace; color: var(--text-secondary);">
          ${userData.id.substring(0, 8)}...
        </span>
      </div>
    </div>
  `
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
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
