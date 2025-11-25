import { signInWithGoogle } from '../services/auth.js'
import { showAccessCodeModal, activateBypass } from '../utils/access-code.js'
import { checkAccessAndRender } from '../main.js'

/**
 * Sign In Gate Component - Ultra Premium Professional Design
 * Custom SVG icons, advanced animations, particle effects
 */
export function renderSignInGate(container) {
  container.innerHTML = `
    <div class="premium-landing" id="premium-landing">
      <!-- Particle Canvas -->
      <canvas id="particles-canvas" class="particles-canvas"></canvas>

      <!-- Mouse Spotlight -->
      <div class="mouse-spotlight" id="mouse-spotlight"></div>

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
          <!-- Custom Book Icon Container -->
          <div class="book-container">
            <div class="book-glow"></div>
            <svg class="book-icon" viewBox="0 0 100 100" width="100" height="100">
              <!-- Book Cover -->
              <defs>
                <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#8C1515;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#B83A3A;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#8C1515;stop-opacity:1" />
                </linearGradient>
                <filter id="bookShadow">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                  <feOffset dx="2" dy="4" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <!-- Book pages -->
              <rect x="25" y="15" width="50" height="70" rx="3" fill="#f5f5f5" filter="url(#bookShadow)">
                <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite"/>
              </rect>
              <rect x="27" y="17" width="46" height="66" rx="2" fill="#ffffff"/>

              <!-- Book cover -->
              <path d="M 30 20 L 30 85 Q 30 88 33 88 L 67 88 Q 70 88 70 85 L 70 20 Q 70 17 67 17 L 33 17 Q 30 17 30 20 Z"
                    fill="url(#bookGradient)" filter="url(#bookShadow)">
                <animateTransform attributeName="transform" type="rotate"
                                  values="0 50 50;-3 50 50;0 50 50;3 50 50;0 50 50"
                                  dur="6s" repeatCount="indefinite"/>
              </path>

              <!-- Book spine highlight -->
              <rect x="30" y="20" width="3" height="65" fill="rgba(255,255,255,0.2)"/>

              <!-- Book pages lines -->
              <line x1="40" y1="30" x2="60" y2="30" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
              <line x1="40" y1="40" x2="60" y2="40" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
              <line x1="40" y1="50" x2="60" y2="50" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
            </svg>
          </div>

          <!-- Title with Gradient -->
          <h1 class="hero-title">
            <span class="gradient-text">Stanford</span>
            <span class="gradient-text-alt">Prompt Library</span>
          </h1>

          <!-- Glowing Subtitle -->
          <p class="hero-subtitle">
            <span class="subtitle-word" style="animation-delay: 0.1s">Elite</span>
            <span class="subtitle-word" style="animation-delay: 0.2s">AI</span>
            <span class="subtitle-word" style="animation-delay: 0.3s">prompts,</span>
            <span class="subtitle-word" style="animation-delay: 0.4s">vetted</span>
            <span class="subtitle-word" style="animation-delay: 0.5s">by</span>
            <span class="subtitle-word" style="animation-delay: 0.6s">Stanford</span>
          </p>
        </div>

        <!-- Feature Cards with Custom Icons -->
        <div class="features-grid">
          <!-- Peer Vetted Card -->
          <div class="feature-card" style="animation-delay: 0.1s" data-feature="vetted">
            <svg class="feature-icon" viewBox="0 0 64 64" width="48" height="48">
              <defs>
                <linearGradient id="vettedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#8C1515;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#ff6b6b;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="28" fill="none" stroke="url(#vettedGradient)" stroke-width="2" opacity="0.3"/>
              <circle cx="32" cy="32" r="24" fill="url(#vettedGradient)" opacity="0.1"/>
              <path d="M 32 18 L 36 28 L 46 28 L 38 34 L 42 44 L 32 38 L 22 44 L 26 34 L 18 28 L 28 28 Z"
                    fill="url(#vettedGradient)" stroke="url(#vettedGradient)" stroke-width="1">
                <animateTransform attributeName="transform" type="rotate"
                                  values="0 32 32;360 32 32" dur="20s" repeatCount="indefinite"/>
              </path>
              <circle cx="32" cy="32" r="6" fill="url(#vettedGradient)">
                <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/>
              </circle>
            </svg>
            <span class="feature-label">Peer Vetted</span>
            <div class="feature-glow"></div>
          </div>

          <!-- Searchable Card -->
          <div class="feature-card" style="animation-delay: 0.2s" data-feature="search">
            <svg class="feature-icon" viewBox="0 0 64 64" width="48" height="48">
              <defs>
                <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#4a90e2;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#67b5ff;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="26" cy="26" r="16" fill="none" stroke="url(#searchGradient)" stroke-width="3">
                <animate attributeName="stroke-dasharray" values="0,100;100,100" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="r" values="16;17;16" dur="3s" repeatCount="indefinite"/>
              </circle>
              <line x1="38" y1="38" x2="50" y2="50" stroke="url(#searchGradient)" stroke-width="4" stroke-linecap="round">
                <animateTransform attributeName="transform" type="rotate"
                                  values="0 26 26;360 26 26" dur="8s" repeatCount="indefinite"/>
              </line>
              <circle cx="26" cy="26" r="10" fill="url(#searchGradient)" opacity="0.1">
                <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite"/>
              </circle>
            </svg>
            <span class="feature-label">Searchable</span>
            <div class="feature-glow"></div>
          </div>

          <!-- Community Card -->
          <div class="feature-card community-badge" id="community-trophy" style="animation-delay: 0.3s"
               data-feature="community" title="Community Driven">
            <svg class="feature-icon" viewBox="0 0 64 64" width="48" height="48">
              <defs>
                <linearGradient id="trophyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#ffd93d;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#f9a825;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#ffd93d;stop-opacity:1" />
                </linearGradient>
              </defs>
              <!-- Trophy base -->
              <rect x="26" y="46" width="12" height="4" fill="url(#trophyGradient)"/>
              <rect x="22" y="50" width="20" height="3" fill="url(#trophyGradient)"/>
              <!-- Trophy stem -->
              <rect x="30" y="40" width="4" height="6" fill="url(#trophyGradient)"/>
              <!-- Trophy cup -->
              <path d="M 20 16 L 20 28 Q 20 35 32 35 Q 44 35 44 28 L 44 16 Z"
                    fill="url(#trophyGradient)" stroke="url(#trophyGradient)" stroke-width="1">
                <animate attributeName="d"
                         values="M 20 16 L 20 28 Q 20 35 32 35 Q 44 35 44 28 L 44 16 Z;
                                M 20 15 L 20 27 Q 20 36 32 36 Q 44 36 44 27 L 44 15 Z;
                                M 20 16 L 20 28 Q 20 35 32 35 Q 44 35 44 28 L 44 16 Z"
                         dur="2s" repeatCount="indefinite"/>
              </path>
              <!-- Trophy handles -->
              <path d="M 20 20 Q 14 20 14 26 Q 14 30 20 30" fill="none" stroke="url(#trophyGradient)" stroke-width="2"/>
              <path d="M 44 20 Q 50 20 50 26 Q 50 30 44 30" fill="none" stroke="url(#trophyGradient)" stroke-width="2"/>
              <!-- Trophy shine -->
              <ellipse cx="28" cy="22" rx="4" ry="6" fill="rgba(255,255,255,0.3)">
                <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite"/>
              </ellipse>
            </svg>
            <span class="feature-label">Community</span>
            <div class="feature-glow stanford-glow"></div>
          </div>
        </div>

        <!-- Premium Sign In Button -->
        <div class="cta-container">
          <button id="signin-btn" class="premium-button">
            <div class="button-bg"></div>
            <div class="button-shine"></div>
            <div class="button-particles"></div>
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
            <svg class="lock-icon" viewBox="0 0 24 24" width="14" height="14">
              <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7z"
                    fill="rgba(255,255,255,0.5)"/>
            </svg>
            <span>@stanford.edu required</span>
          </p>
        </div>

        <!-- Connected Steps Process -->
        <div class="steps-process">
          <svg class="step-connector-svg" viewBox="0 0 400 4" preserveAspectRatio="none">
            <defs>
              <linearGradient id="connectorGradient">
                <stop offset="0%" style="stop-color:#8C1515;stop-opacity:0.5" />
                <stop offset="50%" style="stop-color:#8C1515;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8C1515;stop-opacity:0.5" />
              </linearGradient>
            </defs>
            <line x1="0" y1="2" x2="400" y2="2" stroke="url(#connectorGradient)" stroke-width="2">
              <animate attributeName="stroke-dasharray" values="0,400;400,400" dur="2s" fill="freeze"/>
            </line>
          </svg>

          <div class="step-node" style="animation-delay: 0.5s" data-step="1">
            <div class="step-badge">
              <svg class="step-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      fill="currentColor"/>
              </svg>
              <div class="step-glow"></div>
            </div>
            <span class="step-label">Authenticate</span>
          </div>

          <div class="step-node" style="animation-delay: 0.6s" data-step="2">
            <div class="step-badge">
              <svg class="step-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                      fill="currentColor"/>
              </svg>
              <div class="step-glow"></div>
            </div>
            <span class="step-label">Submit</span>
          </div>

          <div class="step-node" style="animation-delay: 0.7s" data-step="3">
            <div class="step-badge">
              <svg class="step-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      fill="currentColor"/>
              </svg>
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
            <div class="trust-sparkle"></div>
          </div>
          <div class="trust-divider"></div>
          <div class="trust-item">
            <span class="trust-value">850+</span>
            <span class="trust-label">Students</span>
            <div class="trust-sparkle"></div>
          </div>
        </div>

      </div>
    </div>

    <style>
      /* ========================================
         PREMIUM LANDING PAGE - PROFESSIONAL
         NO EMOJIS - CUSTOM SVG ICONS ONLY
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
         PARTICLE SYSTEM
         ======================================== */

      .particles-canvas {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 1;
      }

      .mouse-spotlight {
        position: absolute;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(140, 21, 21, 0.15) 0%, transparent 70%);
        pointer-events: none;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        opacity: 0;
        z-index: 0;
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
          linear-gradient(rgba(140, 21, 21, 0.03) 1.5px, transparent 1.5px),
          linear-gradient(90deg, rgba(140, 21, 21, 0.03) 1.5px, transparent 1.5px);
        background-size: 60px 60px;
        animation: grid-flow 30s linear infinite;
        mask-image: radial-gradient(ellipse at center, black 0%, transparent 80%);
      }

      @keyframes grid-flow {
        0% { transform: translate(0, 0); }
        100% { transform: translate(60px, 60px); }
      }

      .gradient-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(100px);
        opacity: 0.3;
        animation: float-orb 25s ease-in-out infinite;
      }

      .orb-1 {
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, #8C1515 0%, transparent 70%);
        top: -250px;
        left: -250px;
        animation-delay: 0s;
      }

      .orb-2 {
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, #4a90e2 0%, transparent 70%);
        bottom: -200px;
        right: -200px;
        animation-delay: 7s;
      }

      .orb-3 {
        width: 350px;
        height: 350px;
        background: radial-gradient(circle, #8C1515 0%, transparent 70%);
        top: 40%;
        right: 5%;
        animation-delay: 14s;
      }

      @keyframes float-orb {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(40px, -40px) scale(1.1); }
        50% { transform: translate(-30px, 30px) scale(0.9); }
        75% { transform: translate(30px, 40px) scale(1.05); }
      }

      /* ========================================
         MAIN CONTAINER
         ======================================== */

      .landing-container {
        position: relative;
        z-index: 2;
        max-width: 650px;
        width: 100%;
        animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(50px);
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
        margin-bottom: 56px;
      }

      .book-container {
        position: relative;
        display: inline-block;
        margin-bottom: 36px;
        animation: float-3d 8s ease-in-out infinite;
        filter: drop-shadow(0 20px 40px rgba(140, 21, 21, 0.3));
      }

      @keyframes float-3d {
        0%, 100% {
          transform: translateY(0) rotateY(0deg) rotateX(0deg);
        }
        25% {
          transform: translateY(-15px) rotateY(-8deg) rotateX(3deg);
        }
        50% {
          transform: translateY(-25px) rotateY(0deg) rotateX(-3deg);
        }
        75% {
          transform: translateY(-15px) rotateY(8deg) rotateX(3deg);
        }
      }

      .book-icon {
        position: relative;
        z-index: 2;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .book-container:hover .book-icon {
        transform: scale(1.1);
      }

      .book-glow {
        position: absolute;
        inset: -30px;
        background: radial-gradient(circle, rgba(140, 21, 21, 0.5) 0%, transparent 70%);
        animation: glow-pulse 4s ease-in-out infinite;
        z-index: 1;
      }

      @keyframes glow-pulse {
        0%, 100% {
          opacity: 0.4;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.3);
        }
      }

      .hero-title {
        font-size: clamp(38px, 7.5vw, 68px);
        font-weight: 900;
        line-height: 1.08;
        letter-spacing: -0.045em;
        margin: 0 0 24px 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .gradient-text {
        background: linear-gradient(135deg, #ffffff 0%, #e8e8e8 50%, #ffffff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradient-shift 4s ease infinite;
        background-size: 200% 200%;
        position: relative;
      }

      .gradient-text::after {
        content: attr(data-text);
        position: absolute;
        left: 0;
        top: 0;
        z-index: -1;
        background: linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: blur(20px);
        opacity: 0.5;
      }

      .gradient-text-alt {
        background: linear-gradient(135deg, #8C1515 0%, #ff6b6b 30%, #ffd93d 60%, #ff6b6b 90%, #8C1515 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gradient-shift-alt 6s ease infinite;
        background-size: 300% 300%;
        filter: drop-shadow(0 2px 20px rgba(140, 21, 21, 0.4));
      }

      @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      @keyframes gradient-shift-alt {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }

      .hero-subtitle {
        font-size: 22px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.75);
        margin: 0;
        text-shadow: 0 2px 30px rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .subtitle-word {
        display: inline-block;
        animation: word-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes word-fade-in {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ========================================
         FEATURES GRID
         ======================================== */

      .features-grid {
        display: flex;
        gap: 20px;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 56px;
      }

      .feature-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 28px 32px;
        background: rgba(255, 255, 255, 0.02);
        border: 1.5px solid rgba(255, 255, 255, 0.08);
        border-radius: 24px;
        backdrop-filter: blur(30px);
        cursor: pointer;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        animation: scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        overflow: hidden;
      }

      .feature-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
        opacity: 0;
        transition: opacity 0.5s ease;
      }

      .feature-card:hover::before {
        opacity: 1;
      }

      @keyframes scale-in {
        from {
          opacity: 0;
          transform: scale(0.85) translateY(30px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .feature-card:hover {
        transform: translateY(-8px) scale(1.05);
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.25);
        box-shadow:
          0 30px 60px rgba(0, 0, 0, 0.5),
          0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      }

      .feature-card:hover .feature-glow {
        opacity: 1;
        transform: scale(1.2);
      }

      .feature-card:hover .feature-icon {
        transform: scale(1.1) rotate(5deg);
      }

      .feature-icon {
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
      }

      .feature-label {
        font-size: 14px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.95);
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 0.3s ease;
      }

      .feature-card:hover .feature-label {
        color: rgba(255, 255, 255, 1);
        transform: translateY(-2px);
      }

      .feature-glow {
        position: absolute;
        inset: -3px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(140, 21, 21, 0.1));
        border-radius: 24px;
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: -1;
        filter: blur(10px);
      }

      .stanford-glow {
        background: linear-gradient(135deg, rgba(140, 21, 21, 0.4), rgba(255, 215, 0, 0.2));
      }

      /* ========================================
         PREMIUM BUTTON
         ======================================== */

      .cta-container {
        text-align: center;
        margin-bottom: 56px;
      }

      .premium-button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 22px 56px;
        background: #ffffff;
        color: #1a1a2e;
        border: none;
        border-radius: 24px;
        font-size: 18px;
        font-weight: 800;
        cursor: pointer;
        overflow: hidden;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow:
          0 12px 50px rgba(255, 255, 255, 0.12),
          0 0 0 1.5px rgba(255, 255, 255, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 1);
        animation: button-entrance 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
      }

      @keyframes button-entrance {
        from {
          opacity: 0;
          transform: scale(0.85) translateY(30px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .premium-button:hover {
        transform: translateY(-6px) scale(1.04);
        box-shadow:
          0 25px 80px rgba(255, 255, 255, 0.25),
          0 0 0 2px rgba(255, 255, 255, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 1),
          0 0 60px rgba(140, 21, 21, 0.2);
      }

      .premium-button:active {
        transform: translateY(-3px) scale(0.98);
      }

      .button-bg {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 50%, #ffffff 100%);
        z-index: 0;
      }

      .button-shine {
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
        animation: shimmer 4s infinite;
        z-index: 1;
      }

      @keyframes shimmer {
        0% { left: -100%; }
        50%, 100% { left: 200%; }
      }

      .button-particles {
        position: absolute;
        inset: 0;
        opacity: 0;
        transition: opacity 0.5s ease;
        z-index: 1;
      }

      .premium-button:hover .button-particles {
        opacity: 1;
        animation: particles-float 2s ease-out infinite;
      }

      @keyframes particles-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }

      .google-icon, .button-text {
        position: relative;
        z-index: 2;
      }

      .button-ripple {
        position: absolute;
        inset: 0;
        border-radius: 24px;
        pointer-events: none;
      }

      .premium-button:active .button-ripple {
        animation: ripple 0.7s cubic-bezier(0, 0, 0.2, 1);
      }

      @keyframes ripple {
        0% {
          box-shadow: 0 0 0 0 rgba(140, 21, 21, 0.5);
        }
        100% {
          box-shadow: 0 0 0 30px rgba(140, 21, 21, 0);
        }
      }

      .auth-note {
        margin-top: 18px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 500;
      }

      .lock-icon {
        opacity: 0.6;
      }

      /* ========================================
         CONNECTED STEPS
         ======================================== */

      .steps-process {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 40px 30px;
        margin-bottom: 48px;
        background: rgba(255, 255, 255, 0.015);
        border: 1.5px solid rgba(255, 255, 255, 0.06);
        border-radius: 28px;
        backdrop-filter: blur(30px);
      }

      .step-connector-svg {
        position: absolute;
        top: 50%;
        left: 25%;
        right: 25%;
        height: 4px;
        transform: translateY(-50%);
        z-index: 0;
      }

      .step-node {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        animation: scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        cursor: pointer;
      }

      .step-badge {
        position: relative;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.08);
        border: 2.5px solid rgba(140, 21, 21, 0.4);
        border-radius: 50%;
        backdrop-filter: blur(15px);
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        color: rgba(255, 255, 255, 0.9);
      }

      .step-node:hover .step-badge {
        transform: scale(1.2) rotate(5deg);
        border-color: rgba(140, 21, 21, 0.9);
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 8px 30px rgba(140, 21, 21, 0.4);
      }

      .step-icon {
        transition: all 0.3s ease;
      }

      .step-node:hover .step-icon {
        transform: scale(1.1);
      }

      .step-glow {
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(140, 21, 21, 0.5) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.5s ease;
        filter: blur(8px);
      }

      .step-node:hover .step-glow {
        opacity: 1;
        animation: glow-pulse-fast 1.5s ease-in-out infinite;
      }

      @keyframes glow-pulse-fast {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.3); opacity: 1; }
      }

      .step-label {
        font-size: 14px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.85);
        text-transform: uppercase;
        letter-spacing: 0.8px;
        transition: all 0.3s ease;
      }

      .step-node:hover .step-label {
        color: rgba(255, 255, 255, 1);
        transform: translateY(-3px);
      }

      /* ========================================
         TRUST INDICATORS
         ======================================== */

      .trust-indicators {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 32px;
        padding: 32px;
        background: rgba(255, 255, 255, 0.02);
        border: 1.5px solid rgba(255, 255, 255, 0.05);
        border-radius: 24px;
        backdrop-filter: blur(30px);
        animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1s both;
        position: relative;
        overflow: hidden;
      }

      .trust-indicators::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(140, 21, 21, 0.05) 0%, transparent 50%);
        opacity: 0;
        transition: opacity 0.5s ease;
      }

      .trust-indicators:hover::before {
        opacity: 1;
      }

      .trust-item {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        transition: all 0.4s ease;
      }

      .trust-item:hover {
        transform: translateY(-5px) scale(1.05);
      }

      .trust-value {
        font-size: 32px;
        font-weight: 900;
        background: linear-gradient(135deg, #ffffff 0%, #8C1515 50%, #ffd93d 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.02em;
      }

      .trust-label {
        font-size: 13px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.6);
        text-transform: uppercase;
        letter-spacing: 1.2px;
      }

      .trust-sparkle {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 12px;
        height: 12px;
        background: radial-gradient(circle, #ffd93d 0%, transparent 70%);
        border-radius: 50%;
        opacity: 0;
        animation: sparkle 3s ease-in-out infinite;
      }

      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0); }
        50% { opacity: 1; transform: scale(1); }
      }

      .trust-item:hover .trust-sparkle {
        animation: sparkle-fast 1s ease-in-out infinite;
      }

      @keyframes sparkle-fast {
        0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
      }

      .trust-divider {
        width: 2px;
        height: 50px;
        background: linear-gradient(180deg,
          transparent 0%,
          rgba(255, 255, 255, 0.15) 20%,
          rgba(255, 255, 255, 0.25) 50%,
          rgba(255, 255, 255, 0.15) 80%,
          transparent 100%
        );
      }

      /* ========================================
         RESPONSIVE DESIGN
         ======================================== */

      @media (max-width: 768px) {
        .hero-title {
          font-size: clamp(32px, 9vw, 52px);
        }

        .hero-subtitle {
          font-size: 18px;
        }

        .features-grid {
          gap: 16px;
        }

        .feature-card {
          padding: 24px 28px;
        }

        .premium-button {
          padding: 20px 44px;
          font-size: 17px;
        }

        .steps-process {
          flex-direction: column;
          gap: 28px;
          padding: 36px 24px;
        }

        .step-connector-svg {
          display: none;
        }

        .trust-indicators {
          flex-wrap: wrap;
          gap: 20px;
        }
      }

      @media (max-width: 480px) {
        .book-icon {
          width: 80px;
          height: 80px;
        }

        .feature-card {
          flex: 1 1 100%;
          min-width: 160px;
        }

        .premium-button {
          width: 100%;
          padding: 18px 36px;
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
      checkAccessAndRender()
    })
  })

  // Initialize particle system
  initParticleSystem()

  // Initialize mouse tracking
  initMouseTracking()
}

// Particle System
function initParticleSystem() {
  const canvas = document.getElementById('particles-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles = []
  const particleCount = 50

  class Particle {
    constructor() {
      this.reset()
    }

    reset() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.size = Math.random() * 2 + 0.5
      this.speedX = (Math.random() - 0.5) * 0.5
      this.speedY = (Math.random() - 0.5) * 0.5
      this.opacity = Math.random() * 0.5 + 0.2
    }

    update() {
      this.x += this.speedX
      this.y += this.speedY

      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
    }

    draw() {
      ctx.fillStyle = `rgba(140, 21, 21, ${this.opacity})`
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle())
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach(particle => {
      particle.update()
      particle.draw()
    })

    requestAnimationFrame(animate)
  }

  animate()

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })
}

// Mouse Tracking Spotlight
function initMouseTracking() {
  const spotlight = document.getElementById('mouse-spotlight')
  const landing = document.getElementById('premium-landing')

  if (!spotlight || !landing) return

  landing.addEventListener('mousemove', (e) => {
    spotlight.style.left = e.clientX + 'px'
    spotlight.style.top = e.clientY + 'px'
    spotlight.style.opacity = '1'
  })

  landing.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0'
  })
}
