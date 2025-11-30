import './style.css'
import './components/error-pages.css'
import './components/ui/ui-components.css'
import { supabase } from './config/supabase.js'
import { onAuthStateChange } from './services/auth.js'
import { checkUserAccess } from './services/access-control.js'
import { renderSignInGate } from './components/auth/SignInGate.refactored.js'
import { renderSubmitPromptGate } from './components/SubmitPromptGate.js'
import { renderPendingApprovalGate } from './components/PendingApprovalGate.js'
import { renderMainApp } from './components/MainApp.js'
import { validateAuthConfig, displayConfigValidation } from './utils/validate-config.js'

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  const app = document.querySelector('#app')
  if (app) {
    app.innerHTML = `
      <div class="error-page-dark">
        <h1 class="error-page-dark-title">Uncaught Error</h1>
        <p class="error-page-dark-description">An error occurred:</p>
        <pre class="error-page-dark-code">${event.error?.message || event.message}\n\n${event.error?.stack || ''}</pre>
        <p class="error-page-dark-description">Check browser console (F12) for more details.</p>
        <button onclick="window.location.reload()" class="error-page-dark-btn">
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

    // Validate configuration first
    validateAuthConfig()

    // Show loading state
    app.innerHTML = '<div class="loading">Loading...</div>'

    // Check if this is an OAuth callback (has code/token in URL)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const queryParams = new URLSearchParams(window.location.search)

    const hasOAuthParams =
      hashParams.has('access_token') ||
      queryParams.has('code') ||
      hashParams.has('error') ||
      hashParams.has('error_description')

    if (hasOAuthParams) {
      console.log('🔄 OAuth callback detected in URL')
      console.log('🔄 Hash params:', Array.from(hashParams.keys()).join(', ') || 'none')
      console.log('🔄 Query params:', Array.from(queryParams.keys()).join(', ') || 'none')

      // Check for error in OAuth callback
      if (hashParams.has('error') || queryParams.has('error')) {
        const error = hashParams.get('error') || queryParams.get('error')
        const errorDesc = hashParams.get('error_description') || queryParams.get('error_description')
        console.error('❌ OAuth callback error:', error, errorDesc)

        // Show error to user
        app.innerHTML = `
          <div class="error-page-gradient-container">
            <div class="error-page-card">
              <div class="error-page-icon">❌</div>
              <h1 class="error-page-title">Authentication Failed</h1>
              <p class="error-page-description">
                ${errorDesc || error || 'An error occurred during sign-in'}
              </p>
              <button onclick="window.location.href='/'" class="error-page-btn-primary">
                Try Again
              </button>
            </div>
          </div>
        `
        return
      }

      console.log('🔄 Processing OAuth callback...')

      // Wait a moment for Supabase to process the callback
      await new Promise(resolve => setTimeout(resolve, 500))

      // Clean URL after processing to prevent re-processing
      console.log('🔄 Cleaning URL...')
      window.history.replaceState({}, document.title, '/')
    }

    // First, get the current session to check if user is already authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('❌ Session check error:', sessionError)
      throw sessionError
    }

    console.log('Initial session check:', session ? 'Session exists' : 'No session')

    if (session) {
      console.log('✅ User:', session.user.email)
      console.log('✅ Session expires:', new Date(session.expires_at * 1000).toLocaleString())
    }

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

    // Show config warnings if any (only in dev mode)
    if (import.meta.env.DEV) {
      displayConfigValidation(document.body)
    }

  } catch (error) {
    console.error('Initialization error:', error)
    app.innerHTML = `
      <div class="error-page-dark">
        <h1 class="error-page-dark-title">Error Loading Application</h1>
        <p class="error-page-dark-description">The application failed to initialize:</p>
        <pre class="error-page-dark-code">${error.message}\n\n${error.stack || ''}</pre>
        <button onclick="window.location.reload()" class="error-page-dark-btn">
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
          <div class="error-page-gradient-container">
            <div class="error-page-card">
              <div class="error-page-icon">🔧</div>
              <h1 class="error-page-title">Database Setup Required</h1>
              <p class="error-page-description">
                The <code>users</code> table doesn't exist in your Supabase database.
              </p>
              <div class="error-page-instructions">
                <div class="error-page-instructions-title">Quick Fix (1 minute):</div>
                <ol>
                  <li>Open <a href="https://app.supabase.com" target="_blank">Supabase Dashboard</a></li>
                  <li>Go to <strong>SQL Editor</strong></li>
                  <li>Run <code>app/database/schema.sql</code></li>
                  <li>Refresh this page</li>
                </ol>
              </div>
              <button onclick="window.location.reload()" class="error-page-btn-primary">
                Refresh Page
              </button>
            </div>
          </div>
        `
        break

      case 'DATABASE_ERROR':
      case 'PROFILE_CREATION_ERROR':
        app.innerHTML = `
          <div class="error-page-gradient-container">
            <div class="error-page-card">
              <div class="error-page-icon">❌</div>
              <h1 class="error-page-title">${accessStatus.reason === 'DATABASE_ERROR' ? 'Database Error' : 'Profile Creation Error'}</h1>
              <p class="error-page-description">
                ${accessStatus.message}
              </p>
              <div class="error-page-details">
                <details>
                  <summary>Show Error Details</summary>
                  <pre>${JSON.stringify(accessStatus.error, null, 2)}</pre>
                </details>
              </div>
              <div class="error-page-actions">
                <button onclick="window.location.reload()" class="error-page-btn-primary">
                  Refresh Page
                </button>
                <button onclick="window.open('https://app.supabase.com', '_blank')" class="error-page-btn-secondary">
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
