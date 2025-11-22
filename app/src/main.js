import './style.css'
import { supabase } from './config/supabase.js'
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
let isInitialized = false
let authListenerActive = false
let isRendering = false // Prevent concurrent renders

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

    // First, get the current session to check if user is already authenticated
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Initial session check:', session ? 'Session exists' : 'No session')

    // Set up auth state listener FIRST, before checking access
    // This prevents race conditions between listener and initial check
    authListenerActive = true
    onAuthStateChange(async (event, session, profile) => {
      console.log('Auth event:', event, session?.user?.email || 'no user')

      currentUser = session?.user || null
      currentProfile = profile

      // Only render if initialization is complete
      // This prevents double-rendering during startup
      if (isInitialized) {
        await checkAccessAndRender()
      }
    })

    // Wait a brief moment for the auth listener to settle
    await new Promise(resolve => setTimeout(resolve, 100))

    // Mark as initialized
    isInitialized = true

    // Now do the initial access check and render
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
  // Prevent concurrent renders - if already rendering, skip this call
  if (isRendering) {
    console.log('Render already in progress, skipping...')
    return
  }

  try {
    isRendering = true

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

      case 'DATABASE_SETUP_REQUIRED':
        app.innerHTML = `
          <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%); padding: 2rem;">
            <div style="max-width: 600px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 3rem; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 1rem;">🔧</div>
              <h1 style="color: white; font-size: 28px; margin-bottom: 1rem;">Database Setup Required</h1>
              <p style="color: rgba(255,255,255,0.8); margin-bottom: 2rem; line-height: 1.6;">
                The <code style="background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">users</code> table doesn't exist in your Supabase database.
              </p>
              <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; text-align: left;">
                <div style="color: rgba(255,255,255,0.9); font-weight: 600; margin-bottom: 1rem;">Quick Fix (1 minute):</div>
                <ol style="color: rgba(255,255,255,0.8); line-height: 1.8; padding-left: 1.5rem; margin: 0;">
                  <li>Open <a href="https://app.supabase.com" target="_blank" style="color: #8b5cf6; text-decoration: underline;">Supabase Dashboard</a></li>
                  <li>Go to <strong>SQL Editor</strong></li>
                  <li>Run <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px;">app/database/schema.sql</code></li>
                  <li>Refresh this page</li>
                </ol>
              </div>
              <button onclick="window.location.reload()" style="background: #8b5cf6; color: white; border: none; padding: 12px 32px; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: 600;">
                Refresh Page
              </button>
            </div>
          </div>
        `
        break

      case 'DATABASE_ERROR':
      case 'PROFILE_CREATION_ERROR':
        app.innerHTML = `
          <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%); padding: 2rem;">
            <div style="max-width: 600px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 3rem; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 1rem;">❌</div>
              <h1 style="color: white; font-size: 28px; margin-bottom: 1rem;">${accessStatus.reason === 'DATABASE_ERROR' ? 'Database Error' : 'Profile Creation Error'}</h1>
              <p style="color: rgba(255,255,255,0.8); margin-bottom: 2rem; line-height: 1.6;">
                ${accessStatus.message}
              </p>
              <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                <details style="color: rgba(255,255,255,0.8); text-align: left;">
                  <summary style="cursor: pointer; font-weight: 600; margin-bottom: 0.5rem; text-align: center;">Show Error Details</summary>
                  <pre style="background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px; overflow: auto; font-size: 12px; color: #ff6b6b; margin-top: 0.5rem; white-space: pre-wrap; max-height: 300px;">${JSON.stringify(accessStatus.error, null, 2)}</pre>
                </details>
              </div>
              <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button onclick="window.location.reload()" style="background: #8b5cf6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 600;">
                  Refresh Page
                </button>
                <button onclick="window.open('https://app.supabase.com', '_blank')" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 600;">
                  Open Supabase
                </button>
              </div>
            </div>
          </div>
        `
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
  } finally {
    // Always reset rendering flag
    isRendering = false
  }
}

// Export for use in components
export { checkAccessAndRender, currentUser, currentProfile }

// Initialize app
init()
