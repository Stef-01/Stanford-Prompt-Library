import './style.css'
import { onAuthStateChange } from './services/auth.js'
import { checkUserAccess } from './services/access-control.js'
import { renderSignInGate } from './components/SignInGate.js'
import { renderSubmitPromptGate } from './components/SubmitPromptGate.js'
import { renderPendingApprovalGate } from './components/PendingApprovalGate.js'
import { renderMainApp } from './components/MainApp.js'

// Global state
let currentUser = null
let currentProfile = null

// Main app container
const app = document.querySelector('#app')

/**
 * Initialize the application
 */
async function init() {
  console.log('🚀 Stanford Prompt Library initializing...')

  // Show loading state
  app.innerHTML = '<div class="loading">Loading...</div>'

  // Set up auth state listener
  onAuthStateChange(async (event, session, profile) => {
    console.log('Auth state changed:', event)

    currentUser = session?.user || null
    currentProfile = profile

    // Check access and render appropriate view
    await checkAccessAndRender()
  })

  // Initial render
  await checkAccessAndRender()
}

/**
 * Check user access level and render appropriate gate/view
 */
async function checkAccessAndRender() {
  try {
    const accessStatus = await checkUserAccess()
    console.log('Access status:', accessStatus)

    // Clear app
    app.innerHTML = ''

    // Render appropriate view based on access status
    switch (accessStatus.reason) {
      case 'NOT_AUTHENTICATED':
        renderSignInGate(app)
        break

      case 'NO_PROMPT_SUBMITTED':
        renderSubmitPromptGate(app, accessStatus.userData)
        break

      case 'PENDING_APPROVAL':
        renderPendingApprovalGate(app, accessStatus.userData)
        break

      default:
        if (accessStatus.hasAccess) {
          renderMainApp(app, accessStatus.userData)
        } else {
          // Error state
          app.innerHTML = `
            <div class="error-state">
              <h1>⚠️ Access Error</h1>
              <p>${accessStatus.message || 'Unable to verify access'}</p>
              <button onclick="window.location.reload()" class="btn-primary">
                Try Again
              </button>
            </div>
          `
        }
    }
  } catch (error) {
    console.error('Access check error:', error)
    app.innerHTML = `
      <div class="error-state">
        <h1>⚠️ Error</h1>
        <p>Something went wrong. Please try refreshing the page.</p>
        <button onclick="window.location.reload()" class="btn-primary">
          Refresh
        </button>
      </div>
    `
  }
}

// Export for use in components
export { checkAccessAndRender, currentUser, currentProfile }

// Initialize app
init()
