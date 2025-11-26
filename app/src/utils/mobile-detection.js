/**
 * Mobile Detection and Responsive Utilities
 * Provides utilities for detecting mobile devices and managing mobile-specific behaviors
 */

/**
 * Check if device is mobile based on screen width
 */
export function isMobileDevice() {
  return window.innerWidth < 768
}

/**
 * Check if device is tablet
 */
export function isTabletDevice() {
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

/**
 * Check if device is desktop
 */
export function isDesktopDevice() {
  return window.innerWidth >= 1024
}

/**
 * Check if device has touch capability
 */
export function hasTouchSupport() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  )
}

/**
 * Get current device type
 */
export function getDeviceType() {
  if (isMobileDevice()) return 'mobile'
  if (isTabletDevice()) return 'tablet'
  return 'desktop'
}

/**
 * Get viewport dimensions
 */
export function getViewport() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: isMobileDevice(),
    isTablet: isTabletDevice(),
    isDesktop: isDesktopDevice(),
    hasTouch: hasTouchSupport(),
    deviceType: getDeviceType()
  }
}

/**
 * Listen for viewport changes
 */
export function onViewportChange(callback) {
  let currentDeviceType = getDeviceType()

  const handleResize = () => {
    const newDeviceType = getDeviceType()

    // Only fire callback if device type actually changed
    if (newDeviceType !== currentDeviceType) {
      currentDeviceType = newDeviceType
      callback(getViewport())
    }
  }

  window.addEventListener('resize', handleResize)

  // Return cleanup function
  return () => window.removeEventListener('resize', handleResize)
}

/**
 * Add/remove mobile mode class to body
 */
export function updateModeClasses() {
  const viewport = getViewport()

  // Remove all mode classes first
  document.body.classList.remove('mobile-mode', 'tablet-mode', 'desktop-mode')

  // Add appropriate class
  document.body.classList.add(`${viewport.deviceType}-mode`)

  // Add touch class if supported
  if (viewport.hasTouch) {
    document.body.classList.add('touch-device')
  } else {
    document.body.classList.remove('touch-device')
  }

  return viewport
}

/**
 * Initialize mobile detection system
 */
export function initMobileDetection() {
  console.log('📱 Initializing mobile detection...')

  // Set initial classes
  const viewport = updateModeClasses()
  console.log('📱 Device detected:', viewport.deviceType, viewport)

  // Update on resize/orientation change
  window.addEventListener('resize', updateModeClasses)
  window.addEventListener('orientationchange', updateModeClasses)

  // Log orientation changes
  window.addEventListener('orientationchange', () => {
    console.log('📱 Orientation changed:',
      screen.orientation?.type || window.orientation
    )
  })

  return viewport
}

/**
 * Check if current orientation is portrait
 */
export function isPortrait() {
  return window.innerHeight > window.innerWidth
}

/**
 * Check if current orientation is landscape
 */
export function isLandscape() {
  return window.innerWidth > window.innerHeight
}

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaInsets() {
  const style = getComputedStyle(document.documentElement)

  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
  }
}

/**
 * Prevent mobile pull-to-refresh and overscroll
 */
export function preventOverscroll(element = document.body) {
  element.style.overscrollBehavior = 'none'
  element.style.touchAction = 'pan-y'
}

/**
 * Enable mobile pull-to-refresh
 */
export function allowOverscroll(element = document.body) {
  element.style.overscrollBehavior = 'auto'
  element.style.touchAction = 'auto'
}
