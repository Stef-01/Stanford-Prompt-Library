/**
 * Landing Hero Component
 * Main hero section for the sign-in page
 */

import { getIcon } from '../../assets/icons.js'

/**
 * Create landing hero section
 * @param {Object} options - Hero options
 * @returns {HTMLElement} Hero element
 */
export function createLandingHero(options = {}) {
  const {
    title = 'Stanford Prompt Library',
    subtitle = 'Curated collection of AI prompts from Stanford students',
    onSignIn = null,
    onAccessCode = null,
    showBypassButton = false,
    onBypass = null
  } = options

  const hero = document.createElement('div')
  hero.className = 'landing-hero'

  hero.innerHTML = `
    <div class="hero-content">
      <!-- Logo -->
      <div class="hero-logo">
        ${getIcon('sparkles', { width: '64', height: '64', className: 'hero-logo-icon' })}
      </div>

      <!-- Title -->
      <h1 class="hero-title">${title}</h1>

      <!-- Subtitle -->
      <p class="hero-subtitle">${subtitle}</p>

      <!-- Stats -->
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-value">1000+</span>
          <span class="stat-label">Prompts</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">500+</span>
          <span class="stat-label">Members</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">50+</span>
          <span class="stat-label">Categories</span>
        </div>
      </div>

      <!-- Sign In Buttons -->
      <div class="hero-actions">
        <button class="btn btn-primary btn-large btn-sign-in">
          <span class="btn-icon google-icon">${getIcon('googleLogo', { width: '20', height: '20' })}</span>
          <span class="btn-text">Sign in with Google</span>
        </button>

        <button class="btn btn-secondary btn-large btn-access-code">
          <span class="material-icons">vpn_key</span>
          <span class="btn-text">Enter Access Code</span>
        </button>

        ${showBypassButton ? `
          <button class="btn btn-ghost btn-small btn-bypass">
            <span class="material-icons">lock_open</span>
            <span class="btn-text">Developer Bypass</span>
          </button>
        ` : ''}
      </div>

      <!-- Info Banner -->
      <div class="hero-info">
        <div class="info-icon">${getIcon('shield', { width: '20', height: '20' })}</div>
        <p class="info-text">
          This is a private library for Stanford students.
          Sign in with your Stanford email to access.
        </p>
      </div>
    </div>
  `

  // Attach event listeners
  if (onSignIn) {
    const signInBtn = hero.querySelector('.btn-sign-in')
    signInBtn.addEventListener('click', onSignIn)
  }

  if (onAccessCode) {
    const accessCodeBtn = hero.querySelector('.btn-access-code')
    accessCodeBtn.addEventListener('click', onAccessCode)
  }

  if (onBypass && showBypassButton) {
    const bypassBtn = hero.querySelector('.btn-bypass')
    bypassBtn.addEventListener('click', onBypass)
  }

  return hero
}

/**
 * Create animated logo
 * @returns {HTMLElement} Animated logo element
 */
export function createAnimatedLogo() {
  const logo = document.createElement('div')
  logo.className = 'animated-logo'

  logo.innerHTML = `
    <div class="logo-circle circle-1"></div>
    <div class="logo-circle circle-2"></div>
    <div class="logo-circle circle-3"></div>
    <div class="logo-center">
      ${getIcon('brain', { width: '48', height: '48' })}
    </div>
  `

  return logo
}

export default { createLandingHero, createAnimatedLogo }
