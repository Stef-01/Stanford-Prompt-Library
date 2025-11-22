/**
 * Wallpaper Window Component
 * Modern monochrome design with Material Symbols Outlined icons
 */

import { Icon } from '../ui/Icon.js'
import { getAllWallpapers, getCurrentWallpaper, getCurrentIntensity, getCurrentPalette, setWallpaper, setIntensity, setColorPalette } from '../../services/wallpaper.js'
import { colorPalettes } from '../../config/wallpapers.js'

export function renderWallpaperWindow(container) {
  const wallpapers = getAllWallpapers()
  const current = getCurrentWallpaper() || wallpapers[0]
  const intensity = getCurrentIntensity()
  const palette = getCurrentPalette()

  const intensityLabels = ['Minimal', 'Very Low', 'Low', 'Medium-Low', 'Medium', 'Medium-High', 'High', 'Very High', 'Intense', 'Maximum']

  container.innerHTML = `
    <div class="wallpaper-window" style="height: 100%; overflow-y: auto; overflow-x: hidden;">
      <div style="max-width: 1000px; margin: 0 auto; padding: 48px 24px 96px;">

        <!-- Hero Section -->
        <div class="text-center" style="margin-bottom: 48px; animation: fadeIn 0.4s var(--ease-spring);">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px;
                      border-radius: 20px; background: var(--white-5); border: 1px solid var(--border-subtle); margin-bottom: 24px;">
            ${Icon({ name: 'wallpaper', className: 'text-white !text-[48px]' })}
          </div>
          <h1 style="font-size: clamp(32px, 5vw, 48px); font-weight: 700; color: var(--text-primary); margin-bottom: 16px; line-height: 1.1; letter-spacing: -0.02em;">
            Desktop Background
          </h1>
          <p style="font-size: 18px; color: var(--text-subtle); max-width: 600px; margin: 0 auto; line-height: 1.6;">
            Choose from animated and static wallpapers to personalize your workspace
          </p>
        </div>

        <!-- Wallpaper Grid -->
        <div class="wallpapers-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                                            gap: 20px; margin-bottom: 40px;">
          ${wallpapers.map(wallpaper => `
            <div
              class="wallpaper-option ${current && current.id === wallpaper.id ? 'active' : ''}"
              data-wallpaper-id="${wallpaper.id}"
              style="position: relative; aspect-ratio: 1; border-radius: 16px; overflow: hidden; cursor: pointer;
                     border: 2px solid ${current && current.id === wallpaper.id ? 'var(--primary)' : 'var(--border-subtle)'};
                     background: var(--white-5); transition: all 0.3s var(--ease-spring);"
            >
              <!-- Preview -->
              <div class="wallpaper-preview" style="width: 100%; height: 100%; display: flex; align-items: center;
                                                     justify-content: center; font-size: 48px;
                                                     background: ${wallpaper.backgroundColor || '#0A0F1E'};
                                                     ${wallpaper.type === 'css' ? `background-image: ${wallpaper.css};` : ''}
                                                     background-size: cover; background-position: center;">
                ${wallpaper.emoji}
              </div>

              <!-- Active Indicator -->
              ${current && current.id === wallpaper.id ? `
                <div class="active-indicator" style="position: absolute; top: 12px; right: 12px; width: 28px; height: 28px;
                                                        border-radius: 50%; background: var(--primary); display: flex;
                                                        align-items: center; justify-content: center;
                                                        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);">
                  ${Icon({ name: 'check', className: '!text-[18px] text-[var(--background-dark)]' })}
                </div>
              ` : ''}

              <!-- Name Label -->
              <div class="wallpaper-label" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 12px;
                                                   background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
                                                   color: white; font-size: 13px; font-weight: 500; text-align: center;">
                ${wallpaper.name}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Settings Section -->
        <div class="wallpaper-settings" style="background: var(--white-5); border: 1px solid var(--border-subtle);
                                                border-radius: 16px; padding: 28px; margin-bottom: 24px;">
          <h3 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 28px;
                     display: flex; align-items: center; gap: 10px;">
            ${Icon({ name: 'tune', className: '!text-[24px]' })}
            <span>Customization</span>
          </h3>

          <!-- Intensity Control -->
          <div class="control-group" style="margin-bottom: 32px;">
            <label class="control-label" style="font-size: 14px; font-weight: 600; margin-bottom: 12px;
                                                 display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
              ${Icon({ name: 'speed', className: '!text-[20px]' })}
              <span>Animation Intensity</span>
            </label>
            <div class="slider-container" style="display: flex; align-items: center; gap: 16px;">
              <input
                type="range"
                id="intensitySlider"
                min="1"
                max="10"
                value="${intensity}"
                style="flex: 1; height: 6px; border-radius: 3px; background: var(--white-10);
                       outline: none; -webkit-appearance: none; cursor: pointer;"
              >
              <span class="slider-value" id="intensityValue" style="font-size: 13px; color: var(--text-subtle);
                                                                     min-width: 100px; text-align: right; font-weight: 500;">
                ${intensityLabels[intensity - 1]}
              </span>
            </div>
          </div>

          <!-- Color Palette Control -->
          <div class="control-group">
            <label class="control-label" style="font-size: 14px; font-weight: 600; margin-bottom: 12px;
                                                 display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
              ${Icon({ name: 'palette', className: '!text-[20px]' })}
              <span>Color Palette</span>
            </label>
            <div class="color-palette" style="display: flex; gap: 12px; flex-wrap: wrap;">
              ${Object.entries(colorPalettes).map(([key, pal]) => `
                <div
                  class="color-swatch ${palette === key ? 'active' : ''}"
                  data-palette="${key}"
                  style="width: 50px; height: 50px; border-radius: 12px; cursor: pointer;
                         border: 3px solid ${palette === key ? 'var(--primary)' : 'transparent'};
                         background: ${pal.gradient}; transition: all 0.3s var(--ease-spring);
                         box-shadow: ${palette === key ? '0 4px 16px rgba(255, 255, 255, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.3)'};"
                  title="${pal.name}"
                ></div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Description Info Box -->
        <div class="wallpaper-description" style="background: var(--white-5); border: 1px solid var(--border-subtle);
                                                    border-radius: 16px; padding: 24px;">
          <div style="display: flex; align-items: start; gap: 16px;">
            ${Icon({ name: 'info', className: 'text-white !text-[24px]' })}
            <div>
              <p style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">About This Wallpaper</p>
              <p style="font-size: 14px; color: var(--text-subtle); line-height: 1.6;" id="wallpaperDescription">
                ${current ? current.description : 'Select a wallpaper to see details'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  initWallpaperWindowInteractions()
  injectStyles()
}

function initWallpaperWindowInteractions() {
  // Wallpaper selection
  document.querySelectorAll('.wallpaper-option').forEach(option => {
    option.addEventListener('click', () => {
      const wallpaperId = option.dataset.wallpaperId

      // Set wallpaper
      const success = setWallpaper(wallpaperId)

      if (success) {
        // Update UI
        document.querySelectorAll('.wallpaper-option').forEach(opt => {
          opt.classList.remove('active')
          opt.style.borderColor = 'var(--border-subtle)'
          const indicator = opt.querySelector('.active-indicator')
          if (indicator) indicator.remove()
        })

        option.classList.add('active')
        option.style.borderColor = 'var(--primary)'

        // Add check icon
        const indicator = document.createElement('div')
        indicator.className = 'active-indicator'
        indicator.style.cssText = `
          position: absolute;
          top: 12px;
          right: 12px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
        `
        indicator.innerHTML = Icon({ name: 'check', className: '!text-[18px] text-[var(--background-dark)]' })
        option.appendChild(indicator)

        // Update description
        const wallpapers = getAllWallpapers()
        const wallpaper = wallpapers.find(w => w.id === wallpaperId)
        if (wallpaper) {
          const desc = document.getElementById('wallpaperDescription')
          if (desc) desc.textContent = wallpaper.description
        }

        showToast('Wallpaper changed successfully!', 'success')
      }
    })

    // Hover effects
    option.addEventListener('mouseenter', () => {
      if (!option.classList.contains('active')) {
        option.style.borderColor = 'var(--white-30)'
        option.style.transform = 'translateY(-4px) scale(1.02)'
        option.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.1)'
      }
    })

    option.addEventListener('mouseleave', () => {
      if (!option.classList.contains('active')) {
        option.style.borderColor = 'var(--border-subtle)'
        option.style.transform = ''
        option.style.boxShadow = ''
      }
    })
  })

  // Intensity slider
  const intensitySlider = document.getElementById('intensitySlider')
  const intensityValue = document.getElementById('intensityValue')

  if (intensitySlider) {
    // Style the slider thumb
    const style = document.createElement('style')
    style.textContent = `
      #intensitySlider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--primary);
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
      }

      #intensitySlider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--primary);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
      }
    `
    document.head.appendChild(style)

    intensitySlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value)
      const labels = ['Minimal', 'Very Low', 'Low', 'Medium-Low', 'Medium', 'Medium-High', 'High', 'Very High', 'Intense', 'Maximum']
      intensityValue.textContent = labels[value - 1]
      setIntensity(value)
    })
  }

  // Color palette swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const paletteKey = swatch.dataset.palette

      // Set palette
      setColorPalette(paletteKey)

      // Update UI
      document.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.remove('active')
        s.style.borderColor = 'transparent'
        s.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
      })

      swatch.classList.add('active')
      swatch.style.borderColor = 'var(--primary)'
      swatch.style.boxShadow = '0 4px 16px rgba(255, 255, 255, 0.2)'
    })

    // Hover effect
    swatch.addEventListener('mouseenter', () => {
      if (!swatch.classList.contains('active')) {
        swatch.style.transform = 'scale(1.1) translateY(-2px)'
        swatch.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.15)'
      }
    })

    swatch.addEventListener('mouseleave', () => {
      if (!swatch.classList.contains('active')) {
        swatch.style.transform = ''
        swatch.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
      }
    })
  })
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `
    document.body.appendChild(container)
  }

  const toast = document.createElement('div')
  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info'
  }
  const colors = {
    success: 'var(--primary)',
    error: '#EF4444',
    info: '#3B82F6'
  }

  toast.style.cssText = `
    background: var(--white-5);
    border: 1px solid ${colors[type]};
    border-radius: 12px;
    padding: 14px 18px;
    color: var(--text-primary);
    font-size: 14px;
    backdrop-filter: blur(20px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
    animation: slideIn 0.3s var(--ease-spring);
    display: flex;
    align-items: center;
    gap: 10px;
  `

  toast.innerHTML = `
    ${Icon({ name: icons[type], className: '!text-[20px]', style: `color: ${colors[type]}` })}
    <span>${message}</span>
  `
  container.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

function injectStyles() {
  if (document.getElementById('wallpaper-window-styles')) return

  const style = document.createElement('style')
  style.id = 'wallpaper-window-styles'
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideOut {
      to {
        opacity: 0;
        transform: translateX(20px);
      }
    }
  `
  document.head.appendChild(style)
}
