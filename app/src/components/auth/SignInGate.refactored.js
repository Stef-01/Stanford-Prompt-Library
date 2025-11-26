/**
 * SignInGate (Refactored)
 * Main authentication gate using modular components
 */

import { signInWithGoogle } from '../../services/auth.js'
import { showAccessCodeModal, activateBypass } from '../../utils/access-code.js'
import { checkAccessAndRender } from '../../main.js'
import { createParticleBackground } from './ParticleBackground.js'
import { createLandingHero } from './LandingHero.js'
import { createFeatureCards, createTestimonials, createStatsBanner } from './FeatureCards.js'

// Module state
let particleSystem = null

/**
 * Render sign-in gate
 * @param {HTMLElement} container - Container element
 */
export function renderSignInGate(container) {
  if (!container) {
    console.error('[SignInGate] Container not found')
    return
  }

  container.innerHTML = ''
  container.className = 'sign-in-gate'

  // Create main structure
  const wrapper = document.createElement('div')
  wrapper.className = 'sign-in-gate-wrapper'

  // Add particle background
  const particleCanvas = createParticleBackground({
    particleCount: 50,
    particleColor: 'rgba(0, 122, 255, 0.4)',
    lineColor: 'rgba(0, 122, 255, 0.15)',
    mouseInteraction: true
  })
  wrapper.appendChild(particleCanvas)

  // Create content container
  const content = document.createElement('div')
  content.className = 'sign-in-gate-content'

  // Add hero section
  const isDev = import.meta.env.DEV || window.location.hostname === 'localhost'
  const hero = createLandingHero({
    title: 'Stanford Prompt Library',
    subtitle: 'Curated collection of AI prompts from Stanford students',
    onSignIn: handleSignIn,
    onAccessCode: handleAccessCode,
    showBypassButton: isDev,
    onBypass: handleBypass
  })
  content.appendChild(hero)

  // Add stats banner
  content.appendChild(createStatsBanner())

  // Add feature cards
  content.appendChild(createFeatureCards())

  // Add testimonials
  content.appendChild(createTestimonials())

  // Add footer
  content.appendChild(createFooter())

  wrapper.appendChild(content)
  container.appendChild(wrapper)

  // Add scroll reveal animations
  initScrollAnimations()
}

/**
 * Handle sign in
 */
async function handleSignIn() {
  const button = document.querySelector('.btn-sign-in')
  if (!button) return

  // Set loading state
  const originalContent = button.innerHTML
  button.innerHTML = `
    <span class="btn-spinner"></span>
    <span class="btn-text">Signing in...</span>
  `
  button.disabled = true

  try {
    await signInWithGoogle()
    // checkAccessAndRender will be called by auth state change listener
  } catch (error) {
    console.error('Sign in error:', error)

    // Restore button
    button.innerHTML = originalContent
    button.disabled = false

    // Show error message
    showErrorToast('Sign in failed. Please try again.')
  }
}

/**
 * Handle access code
 */
function handleAccessCode() {
  showAccessCodeModal()
}

/**
 * Handle developer bypass
 */
function handleBypass() {
  activateBypass()
  checkAccessAndRender()
}

/**
 * Create footer
 * @returns {HTMLElement} Footer element
 */
function createFooter() {
  const footer = document.createElement('footer')
  footer.className = 'sign-in-footer'

  footer.innerHTML = `
    <div class="footer-content">
      <div class="footer-links">
        <a href="#" class="footer-link">About</a>
        <a href="#" class="footer-link">Privacy</a>
        <a href="#" class="footer-link">Terms</a>
        <a href="#" class="footer-link">Contact</a>
      </div>
      <div class="footer-copyright">
        <p>&copy; ${new Date().getFullYear()} Stanford Prompt Library. All rights reserved.</p>
      </div>
    </div>
  `

  return footer
}

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Observe all animatable elements
  document.querySelectorAll('.feature-card, .testimonial-card, .stat-item').forEach(el => {
    observer.observe(el)
  })
}

/**
 * Show error toast notification
 * @param {string} message - Error message
 */
function showErrorToast(message) {
  const toast = document.createElement('div')
  toast.className = 'error-toast'
  toast.innerHTML = `
    <span class="material-icons">error_outline</span>
    <span>${message}</span>
  `

  document.body.appendChild(toast)

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 100)

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

/**
 * Cleanup sign-in gate
 */
export function cleanupSignInGate() {
  if (particleSystem) {
    particleSystem.destroy()
    particleSystem = null
  }
}

export default { renderSignInGate, cleanupSignInGate }
