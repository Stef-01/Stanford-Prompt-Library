import { signOut } from '../services/auth.js'
import { getUserStatus, subscribeToAccessChanges } from '../services/access-control.js'
import { checkAccessAndRender } from '../main.js'

/**
 * Render the pending approval gate for users waiting for their prompt to be approved
 */
export async function renderPendingApprovalGate(container, userData) {
  // Get detailed user status including initial prompt
  const userStatus = await getUserStatus()
  const initialPrompt = userStatus?.initialPrompt

  container.innerHTML = `
    <div class="access-gate">
      <div class="gate-content">
        <div class="gate-icon">⏳</div>
        <h1 class="gate-title">Your Prompt is Under Review</h1>
        <p class="gate-message">
          Thank you for submitting your prompt! Our team is reviewing it now.
        </p>

        <div class="review-status">
          <div class="status-item completed">
            <span class="status-icon">✓</span>
            <span class="status-text">Prompt submitted</span>
          </div>
          <div class="status-item active">
            <span class="status-icon">⏳</span>
            <span class="status-text">Under review</span>
          </div>
          <div class="status-item">
            <span class="status-icon">○</span>
            <span class="status-text">Access granted</span>
          </div>
        </div>

        ${initialPrompt ? `
          <div class="submitted-prompt">
            <h3>Your Submitted Prompt</h3>
            <div class="prompt-preview">
              <h4>${initialPrompt.title}</h4>
              <p class="prompt-category">${initialPrompt.category}</p>
              <p class="prompt-desc">${initialPrompt.description || 'No description'}</p>
              <p class="prompt-date">Submitted ${formatDate(initialPrompt.created_at)}</p>
            </div>
          </div>
        ` : ''}

        <div class="review-info">
          <h3>What happens next?</h3>
          <ol>
            <li>Your prompt is checked for quality and completeness</li>
            <li>Our team reviews it for content and clarity</li>
            <li>You'll receive an email when approved (usually within 24 hours)</li>
            <li>Once approved, you'll have full access to the library!</li>
          </ol>
        </div>

        <div class="review-tip">
          <p><strong>💡 Tip:</strong> You can close this page. We'll email you when your prompt is approved!</p>
        </div>

        <div class="gate-actions">
          <button id="check-status-btn" class="btn-primary">
            Check Status
          </button>
          <button id="signout-btn" class="btn-secondary">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  `

  // Attach event listeners
  const checkStatusBtn = container.querySelector('#check-status-btn')
  checkStatusBtn.addEventListener('click', () => window.location.reload())

  const signoutBtn = container.querySelector('#signout-btn')
  signoutBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
    }
  })

  // Subscribe to access changes (real-time approval notification)
  if (userData?.id) {
    const channel = subscribeToAccessChanges(userData.id, async (updatedUser) => {
      console.log('User status updated:', updatedUser)

      if (updatedUser.is_approved_member) {
        // User was approved! Show notification and refresh
        showApprovalNotification()
        setTimeout(async () => {
          await checkAccessAndRender()
        }, 2000)
      }
    })

    // Clean up subscription when component is removed
    // (In a real app, you'd do this in a cleanup function)
  }
}

/**
 * Format date string
 */
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return date.toLocaleDateString()
}

/**
 * Show approval notification
 */
function showApprovalNotification() {
  // Create notification element
  const notification = document.createElement('div')
  notification.className = 'notification success'
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">🎉</span>
      <div class="notification-text">
        <strong>Congratulations!</strong>
        <p>Your prompt has been approved. Welcome to the community!</p>
      </div>
    </div>
  `
  document.body.appendChild(notification)

  // Try browser notification too
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Prompt Approved! 🎉', {
      body: 'Your prompt has been approved. You now have full access to the library!',
      icon: '/vite.svg'
    })
  }

  // Remove after 5 seconds
  setTimeout(() => {
    notification.remove()
  }, 5000)
}
