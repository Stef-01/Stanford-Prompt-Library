/**
 * Feature Cards Component
 * Showcase features of the platform
 */

import { getIcon } from '../../assets/icons.js'

/**
 * Create feature cards section
 * @param {Array} features - Array of feature objects
 * @returns {HTMLElement} Feature cards container
 */
export function createFeatureCards(features = null) {
  const defaultFeatures = [
    {
      icon: 'lightning',
      title: 'Curated Prompts',
      description: 'Access high-quality AI prompts tested and refined by Stanford students',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: 'users',
      title: 'Community Driven',
      description: 'Share your prompts and learn from peers in the Stanford community',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: 'star',
      title: 'Leaderboard',
      description: 'Compete with other students and see who creates the best prompts',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: 'zap',
      title: 'Quick Export',
      description: 'Export prompts in multiple formats for use in your favorite AI tools',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      icon: 'trendingUp',
      title: 'Track Performance',
      description: 'See which prompts are most popular and trending in the community',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      icon: 'globe',
      title: 'Open Collaboration',
      description: 'Collaborate with students across departments and share insights',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    }
  ]

  const featureList = features || defaultFeatures

  const container = document.createElement('div')
  container.className = 'feature-cards'

  container.innerHTML = `
    <div class="feature-cards-header">
      <h2 class="section-title">Why Join Our Community?</h2>
      <p class="section-subtitle">
        Discover the benefits of being part of Stanford's AI prompt library
      </p>
    </div>

    <div class="feature-cards-grid">
      ${featureList.map(feature => createFeatureCard(feature)).join('')}
    </div>
  `

  return container
}

/**
 * Create individual feature card
 * @param {Object} feature - Feature data
 * @returns {string} Feature card HTML
 */
function createFeatureCard(feature) {
  return `
    <div class="feature-card" data-aos="fade-up">
      <div class="feature-card-icon" style="background: ${feature.gradient}">
        ${getIcon(feature.icon, { width: '32', height: '32', color: 'white' })}
      </div>
      <h3 class="feature-card-title">${feature.title}</h3>
      <p class="feature-card-description">${feature.description}</p>
    </div>
  `
}

/**
 * Create testimonials section
 * @param {Array} testimonials - Array of testimonial objects
 * @returns {HTMLElement} Testimonials container
 */
export function createTestimonials(testimonials = null) {
  const defaultTestimonials = [
    {
      text: "This library has transformed how I use AI tools. The prompts are incredibly well-crafted!",
      author: "CS Student",
      avatar: "👨‍💻"
    },
    {
      text: "Being able to share and discover prompts from other Stanford students is invaluable.",
      author: "MBA Student",
      avatar: "👩‍💼"
    },
    {
      text: "The leaderboard motivates me to create better prompts. Great community feature!",
      author: "PhD Candidate",
      avatar: "👨‍🔬"
    }
  ]

  const testimonialList = testimonials || defaultTestimonials

  const container = document.createElement('div')
  container.className = 'testimonials-section'

  container.innerHTML = `
    <div class="testimonials-header">
      <h2 class="section-title">What Students Say</h2>
    </div>

    <div class="testimonials-grid">
      ${testimonialList.map(testimonial => `
        <div class="testimonial-card">
          <div class="testimonial-quote">
            ${getIcon('star', { width: '24', height: '24', className: 'quote-icon' })}
            <p class="testimonial-text">"${testimonial.text}"</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar">${testimonial.avatar}</div>
            <div class="author-name">${testimonial.author}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `

  return container
}

/**
 * Create stats banner
 * @param {Object} stats - Statistics object
 * @returns {HTMLElement} Stats banner
 */
export function createStatsBanner(stats = null) {
  const defaultStats = {
    prompts: '1000+',
    users: '500+',
    categories: '50+',
    likes: '10k+'
  }

  const statData = stats || defaultStats

  const banner = document.createElement('div')
  banner.className = 'stats-banner'

  banner.innerHTML = `
    <div class="stats-banner-inner">
      <div class="stat-item">
        ${getIcon('checkCircle', { width: '32', height: '32', className: 'stat-icon' })}
        <div class="stat-content">
          <div class="stat-value">${statData.prompts}</div>
          <div class="stat-label">Quality Prompts</div>
        </div>
      </div>

      <div class="stat-item">
        ${getIcon('users', { width: '32', height: '32', className: 'stat-icon' })}
        <div class="stat-content">
          <div class="stat-value">${statData.users}</div>
          <div class="stat-label">Active Members</div>
        </div>
      </div>

      <div class="stat-item">
        ${getIcon('lightning', { width: '32', height: '32', className: 'stat-icon' })}
        <div class="stat-content">
          <div class="stat-value">${statData.categories}</div>
          <div class="stat-label">Categories</div>
        </div>
      </div>

      <div class="stat-item">
        ${getIcon('star', { width: '32', height: '32', className: 'stat-icon' })}
        <div class="stat-content">
          <div class="stat-value">${statData.likes}</div>
          <div class="stat-label">Total Likes</div>
        </div>
      </div>
    </div>
  `

  return banner
}

export default { createFeatureCards, createTestimonials, createStatsBanner }
