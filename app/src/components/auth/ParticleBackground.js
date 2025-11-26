/**
 * Particle Background Component
 * Animated particle system for visual effects
 */

export class ParticleBackground {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.particles = []
    this.mouse = { x: 0, y: 0 }
    this.animationId = null

    // Configuration
    this.config = {
      particleCount: options.particleCount || 50,
      particleSize: options.particleSize || 2,
      connectionDistance: options.connectionDistance || 150,
      particleSpeed: options.particleSpeed || 0.5,
      particleColor: options.particleColor || 'rgba(0, 122, 255, 0.5)',
      lineColor: options.lineColor || 'rgba(0, 122, 255, 0.2)',
      mouseInteraction: options.mouseInteraction !== false
    }

    this.init()
  }

  init() {
    // Set canvas size
    this.resizeCanvas()

    // Create particles
    this.createParticles()

    // Start animation
    this.animate()

    // Setup event listeners
    if (this.config.mouseInteraction) {
      this.setupMouseTracking()
    }

    // Handle window resize
    window.addEventListener('resize', () => this.resizeCanvas())
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth
    this.canvas.height = this.canvas.offsetHeight
  }

  createParticles() {
    this.particles = []

    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.config.particleSpeed,
        vy: (Math.random() - 0.5) * this.config.particleSpeed,
        radius: Math.random() * this.config.particleSize + 1
      })
    }
  }

  setupMouseTracking() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouse.x = e.clientX - rect.left
      this.mouse.y = e.clientY - rect.top
    })

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1000
      this.mouse.y = -1000
    })
  }

  updateParticles() {
    this.particles.forEach(particle => {
      // Move particle
      particle.x += particle.vx
      particle.y += particle.vy

      // Bounce off edges
      if (particle.x < 0 || particle.x > this.canvas.width) {
        particle.vx *= -1
      }
      if (particle.y < 0 || particle.y > this.canvas.height) {
        particle.vy *= -1
      }

      // Mouse interaction
      if (this.config.mouseInteraction) {
        const dx = this.mouse.x - particle.x
        const dy = this.mouse.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          const force = (100 - distance) / 100
          particle.x -= dx * force * 0.03
          particle.y -= dy * force * 0.03
        }
      }
    })
  }

  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw connections
    this.particles.forEach((p1, i) => {
      this.particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < this.config.connectionDistance) {
          const opacity = 1 - distance / this.config.connectionDistance
          this.ctx.strokeStyle = this.config.lineColor.replace(/[\d.]+\)$/, `${opacity * 0.2})`)
          this.ctx.lineWidth = 1
          this.ctx.beginPath()
          this.ctx.moveTo(p1.x, p1.y)
          this.ctx.lineTo(p2.x, p2.y)
          this.ctx.stroke()
        }
      })
    })

    // Draw particles
    this.particles.forEach(particle => {
      this.ctx.fillStyle = this.config.particleColor
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      this.ctx.fill()
    })
  }

  animate() {
    this.updateParticles()
    this.drawParticles()
    this.animationId = requestAnimationFrame(() => this.animate())
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    window.removeEventListener('resize', () => this.resizeCanvas())
  }
}

/**
 * Create a particle background canvas
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} Canvas element with particle system
 */
export function createParticleBackground(options = {}) {
  const canvas = document.createElement('canvas')
  canvas.className = 'particle-background'
  canvas.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: ${options.mouseInteraction !== false ? 'auto' : 'none'};
  `

  // Initialize particle system
  new ParticleBackground(canvas, options)

  return canvas
}

export default ParticleBackground
