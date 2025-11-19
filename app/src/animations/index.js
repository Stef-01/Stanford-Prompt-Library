/**
 * Animation System - Main Entry Point
 * Exports all animation utilities, variants, config, and components
 */

// Export all variants
export * from './variants'

// Export config and utilities
export * from './config'

// Export all animated components
export * from './AnimatedComponents'

// Re-export commonly used items for convenience
export { motion, AnimatePresence } from 'framer-motion'
