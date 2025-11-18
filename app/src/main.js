import './style.css'
import { onAuthStateChange } from './services/auth.js'
import { checkUserAccess } from './services/access-control.js'
import { renderSignInGate } from './components/SignInGate.js'
import { renderSubmitPromptGate } from './components/SubmitPromptGate.js'
import { renderPendingApprovalGate } from './components/PendingApprovalGate.js'
import { renderMainApp } from './components/MainApp.js'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  const app = document.querySelector('#app')
  if (app) {
    app.innerHTML = `
      <div style="padding: 2rem; color: white; background: #1a1a1a; min-height: 100vh;">
        <h1 style="color: #ef4444;">Uncaught Error</h1>
        <p style="color: #a0a0a0; margin: 1rem 0;">An error occurred:</p>
        <pre style="background: #0a0a0a; padding: 1rem; border-radius: 8px; overflow: auto; color: #ef4444;">${event.error?.message || event.message}\n\n${event.error?.stack || ''}</pre>
        <p style="color: #a0a0a0; margin-top: 1rem;">Check browser console (F12) for more details.</p>
        <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

// Global state
let currentUser = null
let currentProfile = null

// Main app container
const app = document.querySelector('#app')

/**
 * Initialize the application
 */
async function init() {
  try {
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
  } catch (error) {
    console.error('Initialization error:', error)
    app.innerHTML = `
      <div style="padding: 2rem; color: white; background: #1a1a1a; min-height: 100vh;">
        <h1 style="color: #ef4444;">Error Loading Application</h1>
        <p style="color: #a0a0a0; margin: 1rem 0;">The application failed to initialize:</p>
        <pre style="background: #0a0a0a; padding: 1rem; border-radius: 8px; overflow: auto;">${error.message}\n\n${error.stack || ''}</pre>
        <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Retry
        </button>
      </div>
    `
  }
}

/**
 * Check user access level and render appropriate gate/view
 */
async function checkAccessAndRender() {
  try {
    // Show loading state BEFORE clearing content
    app.innerHTML = '<div class="loading">Checking access...</div>'

    // Add timeout detection - if it takes more than 10 seconds, show error
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Loading timeout - this is taking too long. Please clear your browser cache and try again.')), 10000)
    })

    const accessStatus = await Promise.race([
      checkUserAccess(),
      timeoutPromise
    ])

    console.log('Access status:', accessStatus)

    // Clear loading state
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
        <p style="color: #888; font-size: 0.9rem; margin-top: 1rem;">Error: ${error.message}</p>
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
