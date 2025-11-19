/**
 * Enhanced Animation Variants
 * Extended library of Framer Motion-style animation variants
 */

// ==================== TOOL CARD ANIMATIONS ====================

export const toolCardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      delay: index * 0.05, // Stagger delay
    }
  }),
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 400
    }
  },
  tap: {
    scale: 0.98
  }
}

// ==================== VOTE BUTTON ANIMATIONS ====================

export const voteButtonVariants = {
  idle: {
    scale: 1,
    rotate: 0
  },
  hover: {
    scale: 1.15,
    rotate: [0, -5, 5, 0],
    transition: {
      rotate: {
        duration: 0.3,
        ease: "easeInOut"
      },
      scale: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  },
  tap: {
    scale: 0.9
  },
  voted: {
    scale: [1, 1.3, 1],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 0.5,
      ease: "backOut"
    }
  }
}

// ==================== MODAL ANIMATIONS ====================

export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      opacity: { duration: 0.2 }
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

export const modalBackdropVariants = {
  hidden: {
    opacity: 0,
    backdropFilter: "blur(0px)"
  },
  visible: {
    opacity: 1,
    backdropFilter: "blur(8px)",
    transition: {
      duration: 0.2
    }
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: {
      duration: 0.2
    }
  }
}

// ==================== FORM FIELD ANIMATIONS ====================

export const formFieldVariants = {
  rest: {
    borderColor: "rgba(255, 255, 255, 0.1)",
    boxShadow: "0 0 0 0px rgba(59, 130, 246, 0)"
  },
  focus: {
    borderColor: "rgba(59, 130, 246, 1)",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  error: {
    borderColor: "rgba(239, 68, 68, 1)",
    boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)",
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      x: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  },
  success: {
    borderColor: "rgba(34, 197, 94, 1)",
    boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.2)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

// ==================== NUMBER COUNTER ANIMATIONS ====================

export const counterVariants = {
  initial: {
    scale: 1,
    color: "currentColor"
  },
  increment: {
    scale: [1, 1.3, 1],
    color: ["#22c55e", "#22c55e", "currentColor"],
    transition: {
      duration: 0.4,
      ease: "backOut"
    }
  },
  decrement: {
    scale: [1, 0.8, 1],
    color: ["#ef4444", "#ef4444", "currentColor"],
    transition: {
      duration: 0.4,
      ease: "backOut"
    }
  }
}

// ==================== BUTTON ANIMATIONS ====================

export const buttonVariants = {
  idle: {
    scale: 1,
    y: 0
  },
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.98,
    y: 0
  }
}

// ==================== LOADING SKELETON SHIMMER ====================

export const shimmerVariants = {
  initial: {
    backgroundPosition: "-200% 0"
  },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// ==================== BADGE/TAG ANIMATIONS ====================

export const badgeVariants = {
  hidden: {
    opacity: 0,
    scale: 0,
    rotate: -10
  },
  visible: (index) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
      delay: index * 0.05
    }
  }),
  hover: {
    scale: 1.1,
    boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
}

// ==================== RANK MEDAL ANIMATIONS ====================

export const medalVariants = {
  hidden: {
    opacity: 0,
    scale: 0,
    rotate: -180
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 200,
      delay: 0.2
    }
  },
  hover: {
    scale: 1.2,
    rotate: [0, -10, 10, -10, 0],
    transition: {
      rotate: {
        duration: 0.5,
        ease: "easeInOut"
      },
      scale: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  }
}

// ==================== NOTIFICATION/TOAST ANIMATIONS ====================

export const toastVariants = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.8
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
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

// ==================== STAGGER CONTAINER ====================

export const staggerContainerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

// ==================== LIST ITEM ANIMATIONS ====================

export const listItemVariants = {
  hidden: {
    opacity: 0,
    x: -20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  }
}

// ==================== PULSE ANIMATION ====================

export const pulseVariants = {
  initial: {
    scale: 1,
    opacity: 1
  },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// ==================== BOUNCE ANIMATION ====================

export const bounceVariants = {
  initial: {
    y: 0
  },
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// ==================== FADE SLIDE ANIMATIONS ====================

export const fadeSlideVariants = {
  up: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    }
  },
  down: {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    }
  },
  left: {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    }
  },
  right: {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    }
  }
}
