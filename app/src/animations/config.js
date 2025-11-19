/**
 * Animation Configuration
 * Global animation settings with accessibility support
 */

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Global animation configuration
 */
export const animationConfig = {
  // Respect user's motion preferences
  reducedMotion: prefersReducedMotion(),

  // Default transition settings
  transition: {
    type: "spring",
    damping: 25,
    stiffness: 300,
  },

  // Fast transitions for quick interactions
  fast: {
    type: "spring",
    damping: 20,
    stiffness: 400,
  },

  // Slow transitions for emphasis
  slow: {
    type: "spring",
    damping: 30,
    stiffness: 200,
  },

  // Ease-based transitions (no spring physics)
  ease: {
    duration: 0.3,
    ease: "easeInOut"
  },

  // Stagger timing
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
  },
}

/**
 * Get transition config with reduced motion support
 * @param {Object} config - Transition configuration
 * @returns {Object} - Adjusted config based on motion preference
 */
export function getTransition(config = {}) {
  if (prefersReducedMotion()) {
    return {
      duration: 0.01, // Near-instant for reduced motion
      ease: "linear"
    }
  }
  return { ...animationConfig.transition, ...config }
}

/**
 * Get spring config with reduced motion support
 * @param {Object} config - Spring configuration
 * @returns {Object} - Adjusted config based on motion preference
 */
export function getSpringConfig(config = {}) {
  if (prefersReducedMotion()) {
    return {
      type: "tween",
      duration: 0.01,
      ease: "linear"
    }
  }
  return {
    type: "spring",
    ...animationConfig.transition,
    ...config
  }
}

/**
 * Get stagger config with reduced motion support
 * @param {number} stagger - Stagger delay between children
 * @param {number} delayChildren - Initial delay before stagger starts
 * @returns {Object} - Stagger configuration
 */
export function getStaggerConfig(stagger = 0.1, delayChildren = 0) {
  if (prefersReducedMotion()) {
    return {
      staggerChildren: 0,
      delayChildren: 0
    }
  }
  return {
    staggerChildren: stagger,
    delayChildren: delayChildren
  }
}

/**
 * Animation duration constants (in seconds)
 */
export const duration = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
}

/**
 * Easing functions
 */
export const easing = {
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  sharp: [0.4, 0, 0.6, 1],
  anticipate: [0.68, -0.55, 0.265, 1.55],
}

/**
 * Spring presets
 */
export const spring = {
  // Snappy, responsive spring
  snappy: {
    type: "spring",
    damping: 15,
    stiffness: 400,
  },

  // Bouncy spring for playful animations
  bouncy: {
    type: "spring",
    damping: 10,
    stiffness: 300,
  },

  // Gentle spring for smooth animations
  gentle: {
    type: "spring",
    damping: 30,
    stiffness: 200,
  },

  // Stiff spring for quick, minimal oscillation
  stiff: {
    type: "spring",
    damping: 25,
    stiffness: 500,
  },
}

/**
 * Viewport-based animation configuration
 * For scroll-triggered animations using IntersectionObserver
 */
export const viewportConfig = {
  once: true, // Only animate once when entering viewport
  amount: 0.3, // Trigger when 30% of element is visible
  margin: "0px 0px -100px 0px", // Start animation 100px before entering viewport
}

/**
 * Gesture configurations
 */
export const gestureConfig = {
  drag: {
    dragConstraints: { top: 0, left: 0, right: 0, bottom: 0 },
    dragElastic: 0.2,
    dragTransition: { bounceStiffness: 300, bounceDamping: 20 }
  },

  hover: {
    scale: 1.05,
    transition: getSpringConfig({ damping: 15, stiffness: 400 })
  },

  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
}

/**
 * Create animation variants with reduced motion support
 * @param {Object} variants - Animation variants
 * @returns {Object} - Variants adjusted for motion preference
 */
export function createAccessibleVariants(variants) {
  if (!prefersReducedMotion()) {
    return variants
  }

  // Return simplified variants for reduced motion
  const accessibleVariants = {}

  Object.keys(variants).forEach(key => {
    accessibleVariants[key] = {
      opacity: variants[key].opacity ?? 1,
      transition: { duration: 0.01 }
    }
  })

  return accessibleVariants
}

/**
 * Animation orchestration utilities
 */
export const orchestration = {
  /**
   * Stagger children with delay
   */
  staggerChildren: (count, stagger = 0.1, delayChildren = 0) => ({
    staggerChildren: prefersReducedMotion() ? 0 : stagger,
    delayChildren: prefersReducedMotion() ? 0 : delayChildren,
  }),

  /**
   * Sequence multiple animations
   */
  sequence: (...animations) => {
    if (prefersReducedMotion()) {
      return { duration: 0.01 }
    }
    return {
      times: animations.map((_, i) => i / (animations.length - 1)),
      duration: animations.reduce((sum, anim) => sum + (anim.duration || 0.3), 0)
    }
  }
}

/**
 * Performance optimization settings
 */
export const performanceConfig = {
  // Use GPU acceleration
  useGPU: true,

  // Layout animations (more expensive)
  layoutTransition: {
    type: "spring",
    damping: 25,
    stiffness: 300,
  },

  // Transform-only animations (cheaper)
  transformOnly: true,
}

/**
 * Initialize animation system
 * Sets up event listeners for motion preference changes
 */
export function initAnimationSystem() {
  if (typeof window === 'undefined') return

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  // Listen for changes in motion preference
  mediaQuery.addEventListener('change', (e) => {
    animationConfig.reducedMotion = e.matches
    console.log(`Animation system: ${e.matches ? 'Reduced' : 'Full'} motion enabled`)
  })

  console.log('Animation system initialized')
  console.log(`Motion preference: ${prefersReducedMotion() ? 'Reduced' : 'Full'} motion`)
}

/**
 * Debug helper to visualize animation timing
 */
export function debugAnimation(name, variants) {
  console.group(`Animation: ${name}`)
  console.log('Variants:', variants)
  console.log('Reduced motion:', prefersReducedMotion())
  console.groupEnd()
}
