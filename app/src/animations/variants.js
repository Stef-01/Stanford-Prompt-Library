/**
 * Animation Variants Library
 * Centralized collection of Framer Motion animation variants
 */

// ==================== WINDOW ANIMATIONS ====================

export const windowVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    rotateX: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
}

export const windowMinimizeVariants = {
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
  },
  minimized: (dockPosition) => ({
    opacity: 0,
    scale: 0.1,
    x: dockPosition.x,
    y: dockPosition.y,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 200
    }
  })
}

export const windowMaximizeVariants = {
  normal: {
    width: "auto",
    height: "auto",
    x: 0,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 250
    }
  },
  maximized: {
    width: "100%",
    height: "calc(100vh - 132px)", // Account for top bar (32px) and dock (100px)
    x: 0,
    y: 32,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 250
    }
  }
}

// ==================== DOCK ANIMATIONS ====================

export const dockIconVariants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.4,
    y: -8,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 400
    }
  },
  tap: {
    scale: 0.9,
    y: 2,
    transition: {
      duration: 0.1
    }
  },
  bounce: {
    y: [0, -20, 0, -10, 0],
    transition: {
      duration: 0.6,
      times: [0, 0.3, 0.5, 0.7, 1],
      ease: "easeOut"
    }
  }
}

export const dockLabelVariants = {
  hidden: {
    opacity: 0,
    y: 5,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

export const dockContainerVariants = {
  hidden: {
    opacity: 0,
    y: 100,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 200,
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
}

// ==================== LIST & CARD ANIMATIONS ====================

export const listContainerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export const listItemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
    y: 10,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300
    }
  }
}

export const cardVariants = {
  rest: {
    scale: 1,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 400
    }
  },
  tap: {
    scale: 0.98,
  }
}

export const articleCardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      type: "spring",
      damping: 20,
      stiffness: 300
    }
  })
}

// ==================== FORM & INPUT ANIMATIONS ====================

export const formFieldVariants = {
  rest: {
    scale: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  focus: {
    scale: 1.01,
    borderColor: "rgba(59, 130, 246, 0.5)",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    transition: {
      duration: 0.2
    }
  },
  error: {
    borderColor: "rgba(239, 68, 68, 0.5)",
    x: [-10, 10, -10, 10, 0],
    transition: {
      x: {
        duration: 0.4,
        times: [0, 0.25, 0.5, 0.75, 1]
      }
    }
  }
}

export const buttonVariants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 400
    }
  },
  tap: {
    scale: 0.95,
  }
}

export const submitButtonVariants = {
  rest: {
    scale: 1,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  hover: {
    scale: 1.05,
    background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
    boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
    transition: {
      duration: 0.3
    }
  },
  tap: {
    scale: 0.95,
  },
  loading: {
    scale: 1,
    opacity: 0.7,
    transition: {
      duration: 0.2
    }
  }
}

// ==================== MODAL & OVERLAY ANIMATIONS ====================

export const modalBackdropVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2
    }
  }
}

export const modalContentVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
}

// ==================== NOTIFICATION & TOAST ANIMATIONS ====================

export const toastVariants = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.2
    }
  }
}

export const notificationVariants = {
  hidden: {
    opacity: 0,
    x: 100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 200
    }
  }
}

// ==================== LOADING & SKELETON ANIMATIONS ====================

export const skeletonVariants = {
  initial: {
    opacity: 0.4,
  },
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

export const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// ==================== PAGE TRANSITION ANIMATIONS ====================

export const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

// ==================== SCROLL ANIMATIONS ====================

export const fadeInUpVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

export const fadeInDownVariants = {
  hidden: {
    opacity: 0,
    y: -40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

export const scaleInVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// ==================== SUCCESS & ERROR ANIMATIONS ====================

export const successVariants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 0.5,
        ease: "easeInOut"
      },
      opacity: {
        duration: 0.2
      }
    }
  }
}

export const errorShakeVariants = {
  shake: {
    x: [-10, 10, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.5
    }
  }
}

export const confettiVariants = {
  initial: {
    opacity: 1,
    y: 0,
  },
  animate: (index) => ({
    y: [0, -200],
    x: [0, (Math.random() - 0.5) * 200],
    rotate: [0, Math.random() * 360],
    opacity: [1, 0],
    transition: {
      duration: 1 + Math.random(),
      delay: index * 0.05,
      ease: "easeOut"
    }
  })
}

// ==================== BADGE & TOOLTIP ANIMATIONS ====================

export const badgeVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 500
    }
  }
}

export const tooltipVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

// ==================== SPECIAL EFFECTS ====================

export const glowVariants = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(102, 126, 234, 0.2)",
      "0 0 40px rgba(102, 126, 234, 0.4)",
      "0 0 20px rgba(102, 126, 234, 0.2)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const floatVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const wiggleVariants = {
  animate: {
    rotate: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
}
