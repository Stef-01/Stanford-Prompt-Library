import { signInWithGoogle } from '../services/auth.js'
import { showAccessCodeModal, activateBypass } from '../utils/access-code.js'
import { checkAccessAndRender } from '../main.js'

/**
 * Sign In Gate Component - Ultra Premium Design
 * First access gate - requires Stanford email authentication
 */
export function renderSignInGate(container) {
  container.innerHTML = `
    <div class="premium-landing">
      <!-- Animated Background -->
      <div class="animated-bg">
        <div class="grid-pattern"></div>
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <!-- Main Content -->
      <div class="landing-container">

        <!-- Hero Section -->
        <div class="hero-section">
          <!-- 3D Book Container -->
          <div class="book-container">
            <div class="book-glow"></div>
            <div class="book-icon">📚</div>
          </div>

          <!-- Title with Gradient -->
          <h1 class="hero-title">
            <span class="gradient-text">Stanford</span>
            <span class="gradient-text-alt">Prompt Library</span>
          </h1>

          <!-- Glowing Subtitle -->
          <p class="hero-subtitle">
            Elite AI prompts, vetted by Stanford
          </p>
        </div>

        <!-- Feature Pills with Stagger Animation -->
        <div class="features-grid">
          <div class="feature-card" style="animation-delay: 0.1s">
            <div class="feature-icon">🎯</div>
            <span class="feature-label">Peer Vetted</span>
            <div class="feature-glow"></div>
          </div>
          <div class="feature-card" style="animation-delay: 0.2s">
            <div class="feature-icon">🔍</div>
            <span class="feature-label">Searchable</span>
            <div class="feature-glow"></div>
          </div>
          <div class="feature-card community-badge" id="community-trophy" style="animation-delay: 0.3s" title="Community Driven">
            <div class="feature-icon">🏆</div>
            <span class="feature-label">Community</span>
            <div class="feature-glow stanford-glow"></div>
          </div>
        </div>

        <!-- Premium Sign In Button -->
        <div class="cta-container">
          <button id="signin-btn" class="premium-button">
            <div class="button-bg"></div>
            <div class="button-shine"></div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="google-icon">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span class="button-text">Sign in with Stanford</span>
            <div class="button-ripple"></div>
          </button>
          <p class="auth-note">
            <span class="lock-icon">🔒</span>
            @stanford.edu required
          </p>
        </div>

        <!-- Connected Steps Process -->
        <div class="steps-process">
          <div class="step-connector"></div>
          <div class="step-node" style="animation-delay: 0.5s">
            <div class="step-badge">
              <span class="step-number">1</span>
              <div class="step-glow"></div>
            </div>
            <span class="step-label">Authenticate</span>
          </div>
          <div class="step-node" style="animation-delay: 0.6s">
            <div class="step-badge">
              <span class="step-number">2</span>
              <div class="step-glow"></div>
            </div>
            <span class="step-label">Submit</span>
          </div>
          <div class="step-node" style="animation-delay: 0.7s">
            <div class="step-badge">
              <span class="step-number">3</span>
              <div class="step-glow"></div>
            </div>
            <span class="step-label">Access</span>
          </div>
        </div>

        <!-- Trust Indicators -->
        <div class="trust-indicators">
          <div class="trust-item">
            <span class="trust-value">2,100+</span>
            <span class="trust-label">Prompts</span>
          </div>
          <div class="trust-divider"></div>
          <div class="trust-item">
            <span class="trust-value">850+</span>
            <span class="trust-label">Students</span>
          </div>
        </div>

      </div>
    </div>

    <style>
      /* ========================================
         PREMIUM LANDING PAGE STYLES
         ======================================== */

      * {
        box-sizing: border-box;
      }

      .premium-landing {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        overflow: hidden;
        background: #0a0a0a;
      }

      /* ========================================
         ANIMATED BACKGROUND
         ======================================== */

      .animated-bg {
        position: absolute;
        inset: 0;
        overflow: hidden;
        background: radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0a 50%, #0a0a0a 100%);
      }

      .grid-pattern {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(140, 21, 21, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(140, 21, 21, 0.03) 1px, transparent 1px);
        background-size: 50px 50px;
        animation: grid-flow 20s linear infinite;
      }

      @keyframes grid-flow {
        0% { transform: translate(0, 0); }
        100% { transform: translate(50px, 50px); }
      }

      .gradient-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.4;
        animation: float-orb 20s ease-in-out infinite;
      }

      .orb-1 {
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, #8C1515 0%, transparent 70%);
        top: -200px;
        left: -200px;
        animation-delay: 0s;
      }

      .orb-2 {
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, #4a90e2 0%, transparent 70%);
        bottom: -150px;
        right: -150px;
        animation-delay: 5s;
      }

      .orb-3 {
        width: 250px;
        height: 250px;
        background: radial-gradient(circle, #8C1515 0%, transparent 70%);
        top: 50%;
        right: 10%;
        animation-delay: 10s;
      }

      @keyframes float-orb {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -30px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
      }

      /* ========================================
         MAIN CONTAINER
         ======================================== */

      .landing-container {
        position: relative;
        z-index: 1;
        max-width: 600px;
        width: 100%;
        animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ========================================
         HERO SECTION
         ======================================== */

      .hero-section {
        text-align: center;
        margin-bottom: 48px;
      }

      .book-container {
        position: relative;
        display: inline-block;
        margin-bottom: 32px;
        animation: float-3d 6s ease-in-out infinite;
      }

      @keyframes float-3d {
        0%, 100% { transform: translateY(0) rotateY(0deg); }
        50% { transform: translateY(-20px) rotateY(10deg); }
      }

      .book-icon {
        font-size: 80px;
        filter: drop-shadow(0 10px 30px rgba(140, 21, 21, 0.4));
        position: relative;
        z-index: 2;
      }

      .book-glow {
        position: absolute;
        inset: -20px;
        background: radial-gradient(circle, rgba(140, 21, 21, 0.4) 0%, transparent 70%);
        animation: glow-pulse 3s ease-in-out infinite;
        z-index: 1;
      }

      @keyframes glow-pulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }

      .hero-title {
        font-size: clamp(36px, 7vw, 64px);
        font-weight: 900;
        line-height: 1.1;
        letter-spacing: -0.04em;
        margin: 0 0 20px 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .gradient-text {
        background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradient-shift 3s ease infinite;
        background-size: 200% 200%;
      }

      .gradient-text-alt {
        background: linear-gradient(135deg, #8C1515 0%, #ff6b6b 50%, #ffd93d 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradient-shift 3s ease infinite;
        background-size: 200% 200%;
        animation-delay: 0.5s;
      }

      @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      .hero-subtitle {
        font-size: 20px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
        text-shadow: 0 2px 20px rgba(255, 255, 255, 0.1);
      }

      /* ========================================
         FEATURES GRID
         ======================================== */

      .features-grid {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 48px;
      }

      .feature-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 20px 24px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        backdrop-filter: blur(20px);
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        animation: scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes scale-in {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .feature-card:hover {
        transform: translateY(-4px) scale(1.05);
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      }

      .feature-card:hover .feature-glow {
        opacity: 1;
      }

      .feature-icon {
        font-size: 28px;
        filter: drop-shadow(0 4px 12px rgba(255, 255, 255, 0.2));
      }

      .feature-label {
        font-size: 13px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .feature-glow {
        position: absolute;
        inset: -2px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
        border-radius: 20px;
        opacity: 0;
        transition: opacity 0.4s ease;
        z-index: -1;
      }

      .stanford-glow {
        background: linear-gradient(135deg, rgba(140, 21, 21, 0.4), transparent);
      }

      /* ========================================
         PREMIUM BUTTON
         ======================================== */

      .cta-container {
        text-align: center;
        margin-bottom: 48px;
      }

      .premium-button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
        padding: 20px 48px;
        background: #ffffff;
        color: #1a1a2e;
        border: none;
        border-radius: 20px;
        font-size: 17px;
        font-weight: 700;
        cursor: pointer;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow:
          0 10px 40px rgba(255, 255, 255, 0.1),
          0 0 0 1px rgba(255, 255, 255, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.9);
        animation: button-entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
      }

      @keyframes button-entrance {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .premium-button:hover {
        transform: translateY(-4px) scale(1.03);
        box-shadow:
          0 20px 60px rgba(255, 255, 255, 0.2),
          0 0 0 1px rgba(255, 255, 255, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 1);
      }

      .premium-button:active {
        transform: translateY(-2px) scale(0.98);
      }

      .button-bg {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
        z-index: 0;
      }

      .button-shine {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
        animation: shimmer 3s infinite;
        z-index: 1;
      }

      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 200%; }
      }

      .google-icon, .button-text {
        position: relative;
        z-index: 2;
      }

      .button-ripple {
        position: absolute;
        inset: 0;
        border-radius: 20px;
        pointer-events: none;
      }

      .premium-button:active .button-ripple {
        animation: ripple 0.6s ease-out;
      }

      @keyframes ripple {
        0% {
          box-shadow: 0 0 0 0 rgba(140, 21, 21, 0.4);
        }
        100% {
          box-shadow: 0 0 0 20px rgba(140, 21, 21, 0);
        }
      }

      .auth-note {
        margin-top: 16px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .lock-icon {
        font-size: 12px;
        opacity: 0.7;
      }

      /* ========================================
         CONNECTED STEPS
         ======================================== */

      .steps-process {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 32px 20px;
        margin-bottom: 40px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 24px;
        backdrop-filter: blur(20px);
      }

      .step-connector {
        position: absolute;
        top: 50%;
        left: 20%;
        right: 20%;
        height: 2px;
        background: linear-gradient(90deg,
          rgba(140, 21, 21, 0.5) 0%,
          rgba(140, 21, 21, 0.3) 50%,
          rgba(140, 21, 21, 0.5) 100%
        );
        transform: translateY(-50%);
        animation: connector-glow 3s ease-in-out infinite;
      }

      @keyframes connector-glow {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; box-shadow: 0 0 20px rgba(140, 21, 21, 0.5); }
      }

      .step-node {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        animation: scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .step-badge {
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(140, 21, 21, 0.5);
        border-radius: 50%;
        backdrop-filter: blur(10px);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .step-node:hover .step-badge {
        transform: scale(1.15);
        border-color: rgba(140, 21, 21, 0.8);
        background: rgba(255, 255, 255, 0.15);
      }

      .step-number {
        font-size: 18px;
        font-weight: 800;
        color: #ffffff;
        position: relative;
        z-index: 2;
      }

      .step-glow {
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(140, 21, 21, 0.4) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.4s ease;
      }

      .step-node:hover .step-glow {
        opacity: 1;
        animation: glow-pulse 2s ease-in-out infinite;
      }

      .step-label {
        font-size: 13px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.8);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* ========================================
         TRUST INDICATORS
         ======================================== */

      .trust-indicators {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 24px;
        padding: 24px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 20px;
        backdrop-filter: blur(20px);
        animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both;
      }

      .trust-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .trust-value {
        font-size: 28px;
        font-weight: 800;
        background: linear-gradient(135deg, #ffffff 0%, #8C1515 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .trust-label {
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .trust-divider {
        width: 1px;
        height: 40px;
        background: linear-gradient(180deg,
          transparent 0%,
          rgba(255, 255, 255, 0.2) 50%,
          transparent 100%
        );
      }

      /* ========================================
         RESPONSIVE DESIGN
         ======================================== */

      @media (max-width: 768px) {
        .hero-title {
          font-size: clamp(28px, 8vw, 48px);
        }

        .features-grid {
          gap: 12px;
        }

        .feature-card {
          padding: 16px 20px;
        }

        .premium-button {
          padding: 18px 36px;
          font-size: 16px;
        }

        .steps-process {
          flex-direction: column;
          gap: 24px;
          padding: 32px 20px;
        }

        .step-connector {
          display: none;
        }

        .trust-indicators {
          flex-wrap: wrap;
          gap: 16px;
        }
      }

      @media (max-width: 480px) {
        .book-icon {
          font-size: 64px;
        }

        .feature-card {
          flex: 1 1 100%;
          min-width: 140px;
        }

        .premium-button {
          width: 100%;
          padding: 16px 32px;
        }
      }
    </style>
  `

  // Add event listener for sign in
  const signInBtn = container.querySelector('#signin-btn')
  signInBtn.addEventListener('click', async () => {
    try {
      signInBtn.disabled = true
      signInBtn.querySelector('.button-text').textContent = 'Redirecting...'
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
      signInBtn.disabled = false
      signInBtn.querySelector('.button-text').textContent = 'Sign in with Stanford'
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
