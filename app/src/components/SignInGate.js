import { signInWithGoogle } from '../services/auth.js'
import { showAccessCodeModal, activateBypass } from '../utils/access-code.js'
import { checkAccessAndRender } from '../main.js'

/**
 * Sign In Gate Component
 * First access gate - requires Stanford email authentication
 */
export function renderSignInGate(container) {
  container.innerHTML = `
    <div class="access-gate modern-landing">
      <div class="landing-content">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="logo-mark">📚</div>
          <h1 class="hero-title">Stanford Prompt Library</h1>
          <p class="hero-subtitle">Curated AI prompts from the Stanford community</p>
        </div>

        <!-- Feature Pills -->
        <div class="feature-pills">
          <div class="pill">
            <span class="pill-icon">🎯</span>
            <span>Peer-Vetted</span>
          </div>
          <div class="pill">
            <span class="pill-icon">🔍</span>
            <span>Searchable</span>
          </div>
          <div class="pill community-badge" id="community-trophy" title="Community Driven">
            <span class="pill-icon">🏆</span>
            <span>Community Built</span>
          </div>
        </div>

        <!-- Sign In Button -->
        <div class="cta-section">
          <button id="signin-btn" class="signin-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="google-icon">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Stanford</span>
          </button>
          <p class="auth-note">@stanford.edu required</p>
        </div>

        <!-- Quick Steps -->
        <div class="steps-minimal">
          <div class="step-item">
            <span class="step-num">1</span>
            <span class="step-text">Sign in</span>
          </div>
          <div class="step-divider">→</div>
          <div class="step-item">
            <span class="step-num">2</span>
            <span class="step-text">Submit prompt</span>
          </div>
          <div class="step-divider">→</div>
          <div class="step-item">
            <span class="step-num">3</span>
            <span class="step-text">Get access</span>
          </div>
        </div>
      </div>
    </div>

    <style>
      .modern-landing {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
        padding: 40px 20px;
      }

      .landing-content {
        max-width: 560px;
        width: 100%;
        text-align: center;
        animation: fadeInUp 0.8s ease-out;
      }

      .hero-section {
        margin-bottom: 48px;
      }

      .logo-mark {
        font-size: 72px;
        margin-bottom: 24px;
        animation: float 3s ease-in-out infinite;
      }

      .hero-title {
        font-size: clamp(32px, 6vw, 48px);
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 16px 0;
        letter-spacing: -0.03em;
        line-height: 1.1;
      }

      .hero-subtitle {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 400;
        margin: 0;
      }

      .feature-pills {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 48px;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 100px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }

      .pill:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      .pill-icon {
        font-size: 18px;
      }

      .pill span:last-child {
        font-size: 14px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
      }

      .cta-section {
        margin-bottom: 48px;
      }

      .signin-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 18px 36px;
        background: #ffffff;
        color: #1a1a2e;
        border: none;
        border-radius: 16px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3),
                    0 0 0 1px rgba(255, 255, 255, 0.1);
        margin-bottom: 12px;
      }

      .signin-button:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4),
                    0 0 0 1px rgba(255, 255, 255, 0.2);
      }

      .signin-button:active {
        transform: translateY(0) scale(0.98);
      }

      .google-icon {
        flex-shrink: 0;
      }

      .auth-note {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.5);
        margin: 0;
      }

      .steps-minimal {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
        padding: 24px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        backdrop-filter: blur(10px);
      }

      .step-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .step-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        font-size: 13px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.9);
      }

      .step-text {
        font-size: 14px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
      }

      .step-divider {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.3);
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @media (max-width: 640px) {
        .steps-minimal {
          flex-direction: column;
          gap: 12px;
        }

        .step-divider {
          transform: rotate(90deg);
        }
      }
    </style>
  `

  // Add event listener for sign in
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

  // Add event listener for access code trigger (trophy icon)
  const trophyIcon = container.querySelector('#community-trophy')
  trophyIcon.addEventListener('click', () => {
    showAccessCodeModal(() => {
      // Bypass activated, reload the app
      checkAccessAndRender()
    })
  })
}
