import { signInWithGoogle } from '../services/auth.js'

/**
 * Sign In Gate Component
 * First access gate - requires Stanford email authentication
 */
export function renderSignInGate(container) {
  container.innerHTML = `
    <div class="access-gate">
      <div class="access-gate-content">
        <div class="gate-header">
          <h1>📚 Stanford Prompt Library</h1>
          <p class="subtitle">A curated collection of high-quality prompts from the Stanford community</p>
        </div>

        <div class="gate-features">
          <div class="feature">
            <span class="feature-icon">🎯</span>
            <div>
              <h3>Quality Prompts</h3>
              <p>Vetted by peers and experts</p>
            </div>
          </div>
          <div class="feature">
            <span class="feature-icon">🔍</span>
            <div>
              <h3>Search & Filter</h3>
              <p>Find exactly what you need</p>
            </div>
          </div>
          <div class="feature">
            <span class="feature-icon">🏆</span>
            <div>
              <h3>Community Driven</h3>
              <p>Built by Stanford, for Stanford</p>
            </div>
          </div>
        </div>

        <div class="gate-action">
          <button id="signin-btn" class="btn-primary btn-large">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Stanford Email
          </button>
          <p class="gate-note">🔒 Only Stanford email addresses (@stanford.edu) are allowed</p>
        </div>

        <div class="gate-info">
          <h3>How it works:</h3>
          <ol>
            <li>Sign in with your Stanford email</li>
            <li>Submit one quality prompt to unlock access</li>
            <li>Browse and contribute to the library</li>
          </ol>
        </div>
      </div>
    </div>
  `

  // Add event listener
  const signInBtn = container.querySelector('#signin-btn')
  signInBtn.addEventListener('click', async () => {
    try {
      signInBtn.disabled = true
      signInBtn.innerHTML = 'Redirecting to Google...'
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
      signInBtn.disabled = false
      signInBtn.innerHTML = 'Sign in with Stanford Email'
      alert('Sign in failed. Please try again.')
    }
  })
}
