/**
 * Animation Helper Functions
 * Utility functions for creating smooth, performant animations
 */

import { prefersReducedMotion } from './config.js'

// ==================== STAGGER UTILITIES ====================

/**
 * Create stagger children configuration
 * @param {number} staggerDelay - Delay between each child (seconds)
 * @param {number} delayChildren - Initial delay before stagger starts
 * @returns {Object} Stagger configuration
 */
export function createStagger(staggerDelay = 0.05, delayChildren = 0) {
  if (prefersReducedMotion()) {
    return { visible: { transition: { duration: 0 } } }
  }

  return {
    visible: {
      transition: {
        delayChildren,
        staggerChildren: staggerDelay
      }
    }
  }
}

/**
 * Apply staggered entrance animation to elements
 * @param {NodeList|Array} elements - Elements to animate
 * @param {number} staggerDelay - Delay between each element (ms)
 */
export function staggerIn(elements, staggerDelay = 50) {
  if (prefersReducedMotion()) return

  elements.forEach((element, index) => {
    element.style.opacity = '0'
    element.style.transform = 'translateY(20px)'

    setTimeout(() => {
      element.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      element.style.opacity = '1'
      element.style.transform = 'translateY(0)'
    }, index * staggerDelay)
  })
}

// ==================== NUMBER COUNTER ANIMATIONS ====================

/**
 * Animate number changes with easing
 * @param {HTMLElement} element - Element to update
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} duration - Animation duration (ms)
 * @param {Function} callback - Optional callback when complete
 */
export function animateValue(element, start, end, duration = 500, callback = null) {
  if (prefersReducedMotion()) {
    element.textContent = end > 0 ? `+${end}` : end
    if (callback) callback()
    return
  }

  const startTime = performance.now()
  const diff = end - start

  function update(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-out cubic)
    const eased = 1 - Math.pow(1 - progress, 3)

    const current = Math.round(start + diff * eased)
    element.textContent = current > 0 ? `+${current}` : current

    if (progress < 1) {
      requestAnimationFrame(update)
    } else if (callback) {
      callback()
    }
  }

  requestAnimationFrame(update)
}

/**
 * Animate counter with color change
 * @param {HTMLElement} element - Element to animate
 * @param {number} oldValue - Previous value
 * @param {number} newValue - New value
 */
export function animateCounter(element, oldValue, newValue) {
  if (prefersReducedMotion()) {
    element.textContent = newValue > 0 ? `+${newValue}` : newValue
    return
  }

  const isIncrement = newValue > oldValue
  const color = isIncrement ? '#22c55e' : '#ef4444'

  // Animate the number
  animateValue(element, oldValue, newValue, 400)

  // Animate scale and color
  element.animate([
    { transform: 'scale(1)', color: 'currentColor' },
    { transform: isIncrement ? 'scale(1.3)' : 'scale(0.8)', color: color },
    { transform: 'scale(1)', color: 'currentColor' }
  ], {
    duration: 400,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  })
}

// ==================== PARTICLE EFFECTS ====================

/**
 * Create particle explosion effect
 * @param {number} x - X coordinate (screen)
 * @param {number} y - Y coordinate (screen)
 * @param {string} color - Particle color
 * @param {number} particleCount - Number of particles
 */
export function createParticleExplosion(x, y, color = '#3b82f6', particleCount = 12) {
  if (prefersReducedMotion()) return

  const particles = []

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount
    const velocity = 2 + Math.random() * 2

    const particle = document.createElement('div')
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 6px;
      height: 6px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      box-shadow: 0 0 10px ${color};
    `
    document.body.appendChild(particle)

    particles.push({
      element: particle,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: 1
    })
  }

  function animate() {
    let hasAlive = false

    particles.forEach(p => {
      if (p.life <= 0) return

      const rect = p.element.getBoundingClientRect()
      p.element.style.left = rect.left + p.vx + 'px'
      p.element.style.top = rect.top + p.vy + 'px'
      p.element.style.opacity = p.life

      p.vy += 0.1 // Gravity
      p.life -= 0.02
      hasAlive = true
    })

    if (hasAlive) {
      requestAnimationFrame(animate)
    } else {
      particles.forEach(p => p.element.remove())
    }
  }

  animate()
}

/**
 * Create confetti explosion
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
export function createConfetti(x, y) {
  if (prefersReducedMotion()) return

  const colors = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ec4899']
  createParticleExplosion(x, y, colors[Math.floor(Math.random() * colors.length)], 20)
}

// ==================== RIPPLE EFFECTS ====================

/**
 * Create ripple effect on click
 * @param {MouseEvent} event - Click event
 * @param {HTMLElement} element - Element to create ripple on
 */
export function createRipple(event, element) {
  if (prefersReducedMotion()) return

  const circle = document.createElement('span')
  const diameter = Math.max(element.clientWidth, element.clientHeight)
  const radius = diameter / 2

  const rect = element.getBoundingClientRect()
  const x = event.clientX - rect.left - radius
  const y = event.clientY - rect.top - radius

  circle.style.cssText = `
    position: absolute;
    width: ${diameter}px;
    height: ${diameter}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    pointer-events: none;
  `

  const ripple = element.appendChild(circle)

  ripple.animate([
    { transform: 'scale(0)', opacity: 1 },
    { transform: 'scale(2)', opacity: 0 }
  ], {
    duration: 600,
    easing: 'ease-out'
  }).onfinish = () => ripple.remove()
}

// ==================== ELEMENT ANIMATIONS ====================

/**
 * Shake element (for errors)
 * @param {HTMLElement} element - Element to shake
 */
export function shakeElement(element) {
  if (prefersReducedMotion()) return

  element.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(0)' }
  ], {
    duration: 400,
    easing: 'ease-in-out'
  })
}

/**
 * Pulse element (for attention)
 * @param {HTMLElement} element - Element to pulse
 */
export function pulseElement(element) {
  if (prefersReducedMotion()) return

  element.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.05)' },
    { transform: 'scale(1)' }
  ], {
    duration: 600,
    easing: 'ease-in-out'
  })
}

/**
 * Bounce element
 * @param {HTMLElement} element - Element to bounce
 */
export function bounceElement(element) {
  if (prefersReducedMotion()) return

  element.animate([
    { transform: 'translateY(0)' },
    { transform: 'translateY(-20px)' },
    { transform: 'translateY(0)' },
    { transform: 'translateY(-10px)' },
    { transform: 'translateY(0)' }
  ], {
    duration: 600,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  })
}

/**
 * Fade in element
 * @param {HTMLElement} element - Element to fade in
 * @param {number} duration - Duration in ms
 */
export function fadeIn(element, duration = 300) {
  if (prefersReducedMotion()) {
    element.style.opacity = '1'
    return
  }

  element.animate([
    { opacity: 0 },
    { opacity: 1 }
  ], {
    duration,
    easing: 'ease-out',
    fill: 'forwards'
  })
}

/**
 * Fade out element
 * @param {HTMLElement} element - Element to fade out
 * @param {number} duration - Duration in ms
 * @param {Function} callback - Callback when complete
 */
export function fadeOut(element, duration = 300, callback = null) {
  if (prefersReducedMotion()) {
    element.style.opacity = '0'
    if (callback) callback()
    return
  }

  const animation = element.animate([
    { opacity: 1 },
    { opacity: 0 }
  ], {
    duration,
    easing: 'ease-in',
    fill: 'forwards'
  })

  if (callback) {
    animation.onfinish = callback
  }
}

// ==================== SCROLL ANIMATIONS ====================

/**
 * Initialize scroll-triggered animations
 * @param {string} selector - Selector for elements to animate
 * @param {Object} options - Intersection Observer options
 */
export function initScrollAnimations(selector = '[data-animate]', options = {}) {
  if (prefersReducedMotion()) {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('animate-in')
    })
    return
  }

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
          observer.unobserve(entry.target)
        }
      })
    },
    defaultOptions
  )

  document.querySelectorAll(selector).forEach(el => {
    observer.observe(el)
  })

  return observer
}

// ==================== MODAL ANIMATIONS ====================

/**
 * Show modal with spring animation
 * @param {HTMLElement} modal - Modal element
 * @param {HTMLElement} content - Modal content element
 */
export function showModal(modal, content) {
  if (!modal || !content) return

  modal.style.display = 'flex'

  if (prefersReducedMotion()) {
    modal.style.opacity = '1'
    content.style.opacity = '1'
    content.style.transform = 'none'
    return
  }

  // Backdrop fade in
  modal.animate([
    { opacity: 0 },
    { opacity: 1 }
  ], {
    duration: 200,
    easing: 'ease-out',
    fill: 'forwards'
  })

  // Content spring in
  content.animate([
    {
      transform: 'scale(0.8) translateY(50px)',
      opacity: 0
    },
    {
      transform: 'scale(1) translateY(0)',
      opacity: 1
    }
  ], {
    duration: 400,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    fill: 'forwards'
  })
}

/**
 * Hide modal with animation
 * @param {HTMLElement} modal - Modal element
 * @param {HTMLElement} content - Modal content element
 * @param {Function} callback - Callback when hidden
 */
export function hideModal(modal, content, callback = null) {
  if (!modal || !content) return

  if (prefersReducedMotion()) {
    modal.style.display = 'none'
    if (callback) callback()
    return
  }

  // Content scale out
  content.animate([
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(0.8)', opacity: 0 }
  ], {
    duration: 200,
    easing: 'ease-in',
    fill: 'forwards'
  })

  // Backdrop fade out
  const backdropAnim = modal.animate([
    { opacity: 1 },
    { opacity: 0 }
  ], {
    duration: 200,
    easing: 'ease-in',
    fill: 'forwards'
  })

  backdropAnim.onfinish = () => {
    modal.style.display = 'none'
    if (callback) callback()
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Wait for animation to complete
 * @param {number} duration - Duration in ms
 * @returns {Promise}
 */
export function wait(duration) {
  return new Promise(resolve => setTimeout(resolve, duration))
}

/**
 * Get cubic bezier easing string
 * @param {string} type - Easing type: 'spring', 'smooth', 'easeOut', 'easeIn'
 * @returns {string} CSS easing string
 */
export function getEasing(type = 'spring') {
  const easings = {
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    anticipate: 'cubic-bezier(0.36, 0, 0.66, -0.56)'
  }

  return easings[type] || easings.spring
}

/**
 * Apply spring animation to element
 * @param {HTMLElement} element - Element to animate
 * @param {Object} from - Starting values
 * @param {Object} to - Ending values
 * @param {Object} options - Animation options
 */
export function springAnimate(element, from, to, options = {}) {
  if (prefersReducedMotion()) {
    Object.assign(element.style, to)
    if (options.onComplete) options.onComplete()
    return
  }

  const {
    duration = 400,
    easing = getEasing('spring'),
    onComplete = null
  } = options

  const keyframes = [from, to]

  const animation = element.animate(keyframes, {
    duration,
    easing,
    fill: 'forwards'
  })

  if (onComplete) {
    animation.onfinish = onComplete
  }

  return animation
}

// ==================== EXPORT ALL ====================

export default {
  createStagger,
  staggerIn,
  animateValue,
  animateCounter,
  createParticleExplosion,
  createConfetti,
  createRipple,
  shakeElement,
  pulseElement,
  bounceElement,
  fadeIn,
  fadeOut,
  initScrollAnimations,
  showModal,
  hideModal,
  wait,
  getEasing,
  springAnimate
}
