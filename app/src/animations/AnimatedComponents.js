/**
 * Animated Component Primitives
 * Reusable components with Framer Motion animations
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  windowVariants,
  dockIconVariants,
  dockLabelVariants,
  cardVariants,
  buttonVariants,
  modalBackdropVariants,
  modalContentVariants,
  fadeInUpVariants,
  listContainerVariants,
  listItemVariants,
} from './variants'
import { getSpringConfig, getTransition, viewportConfig } from './config'

// ==================== LAYOUT COMPONENTS ====================

/**
 * Animated Window
 * Desktop window with enter/exit animations
 */
export function AnimatedWindow({ children, isOpen, onClose, className, ...props }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={className}
          variants={windowVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Animated Dock Icon
 * Icon with hover, tap, and bounce animations
 */
export function AnimatedDockIcon({ children, onClick, onHover, className, ...props }) {
  return (
    <motion.div
      className={className}
      variants={dockIconVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      onHoverStart={onHover}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Animated Dock Label
 * Tooltip-style label with fade-in animation
 */
export function AnimatedDockLabel({ children, show, className, ...props }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          variants={dockLabelVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ==================== CONTENT COMPONENTS ====================

/**
 * Animated Card
 * Card with hover and tap effects
 */
export function AnimatedCard({ children, onClick, className, ...props }) {
  return (
    <motion.div
      className={className}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Animated List
 * Container for staggered list animations
 */
export function AnimatedList({ children, className, ...props }) {
  return (
    <motion.div
      className={className}
      variants={listContainerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Animated List Item
 * Individual list item with enter animation
 */
export function AnimatedListItem({ children, className, ...props }) {
  return (
    <motion.div
      className={className}
      variants={listItemVariants}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade In Up
 * Scroll-triggered fade and slide up animation
 */
export function FadeInUp({ children, className, delay = 0, ...props }) {
  const [ref, inView] = useInView({
    ...viewportConfig,
    triggerOnce: true,
  })

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeInUpVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Scale In
 * Scroll-triggered scale animation
 */
export function ScaleIn({ children, className, delay = 0, ...props }) {
  const [ref, inView] = useInView({
    ...viewportConfig,
    triggerOnce: true,
  })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ delay, ...getSpringConfig() }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ==================== INTERACTION COMPONENTS ====================

/**
 * Animated Button
 * Button with hover and tap effects
 */
export function AnimatedButton({ children, onClick, className, disabled, ...props }) {
  return (
    <motion.button
      className={className}
      variants={buttonVariants}
      initial="rest"
      whileHover={disabled ? {} : "hover"}
      whileTap={disabled ? {} : "tap"}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}

/**
 * Animated Input
 * Input field with focus animation
 */
export function AnimatedInput({ className, error, ...props }) {
  return (
    <motion.input
      className={className}
      initial="rest"
      whileFocus="focus"
      animate={error ? "error" : "rest"}
      variants={{
        rest: { scale: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
        focus: {
          scale: 1.01,
          borderColor: "rgba(59, 130, 246, 0.5)",
          boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        },
        error: {
          borderColor: "rgba(239, 68, 68, 0.5)",
          x: [-10, 10, -10, 10, 0],
        }
      }}
      {...props}
    />
  )
}

// ==================== MODAL & OVERLAY COMPONENTS ====================

/**
 * Animated Modal
 * Modal with backdrop blur and content animation
 */
export function AnimatedModal({ children, isOpen, onClose, className, ...props }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />

          {/* Modal Content */}
          <motion.div
            className={className}
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
            }}
            {...props}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Animated Dropdown
 * Dropdown menu with smooth expand/collapse
 */
export function AnimatedDropdown({ children, isOpen, className, ...props }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={className}
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={getTransition({ duration: 0.2 })}
          style={{ overflow: 'hidden' }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ==================== NOTIFICATION COMPONENTS ====================

/**
 * Animated Toast
 * Toast notification with slide-in animation
 */
export function AnimatedToast({ children, isVisible, onDismiss, className, ...props }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100 }}
          transition={getSpringConfig()}
          {...props}
        >
          {children}
          {onDismiss && (
            <button
              onClick={onDismiss}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Animated Badge
 * Badge with pop-in animation
 */
export function AnimatedBadge({ children, show = true, className, ...props }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 500 }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ==================== LOADING COMPONENTS ====================

/**
 * Animated Spinner
 * Rotating loading spinner
 */
export function AnimatedSpinner({ size = 24, className, ...props }) {
  return (
    <motion.div
      className={className}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        width: size,
        height: size,
        border: '3px solid rgba(255, 255, 255, 0.2)',
        borderTopColor: '#fff',
        borderRadius: '50%',
      }}
      {...props}
    />
  )
}

/**
 * Animated Skeleton
 * Pulsing skeleton loader
 */
export function AnimatedSkeleton({ width = '100%', height = 20, className, ...props }) {
  return (
    <motion.div
      className={className}
      animate={{
        opacity: [0.4, 0.8, 0.4],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        width,
        height,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
      }}
      {...props}
    />
  )
}

/**
 * Animated Pulse
 * Pulsing element for highlighting
 */
export function AnimatedPulse({ children, className, ...props }) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ==================== GESTURE COMPONENTS ====================

/**
 * Animated Draggable
 * Draggable element with constraints
 */
export function AnimatedDraggable({ children, className, constraints, ...props }) {
  return (
    <motion.div
      className={className}
      drag
      dragConstraints={constraints}
      dragElastic={0.2}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Animated Hover Scale
 * Simple hover scale effect
 */
export function AnimatedHoverScale({ children, scale = 1.05, className, ...props }) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: 0.95 }}
      transition={getSpringConfig({ damping: 15, stiffness: 400 })}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ==================== SPECIAL EFFECTS ====================

/**
 * Animated Glow
 * Glowing effect animation
 */
export function AnimatedGlow({ children, className, color = "rgba(102, 126, 234, 0.4)", ...props }) {
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          `0 0 20px ${color}`,
          `0 0 40px ${color}`,
          `0 0 20px ${color}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Animated Float
 * Floating animation
 */
export function AnimatedFloat({ children, className, distance = 10, ...props }) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -distance, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ==================== UTILITY COMPONENTS ====================

/**
 * Stagger Container
 * Generic container for staggered children animations
 */
export function StaggerContainer({ children, className, stagger = 0.1, ...props }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: stagger,
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade In Out
 * Simple fade animation controlled by show prop
 */
export function FadeInOut({ children, show, className, ...props }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={getTransition()}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Slide In Out
 * Slide animation from specified direction
 */
export function SlideInOut({ children, show, direction = 'left', className, ...props }) {
  const directions = {
    left: { x: -100 },
    right: { x: 100 },
    top: { y: -100 },
    bottom: { y: 100 },
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          initial={{ opacity: 0, ...directions[direction] }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, ...directions[direction] }}
          transition={getTransition()}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
