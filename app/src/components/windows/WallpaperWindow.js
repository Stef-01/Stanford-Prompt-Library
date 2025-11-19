/**
 * Wallpaper Window Component
 * UI for selecting and customizing desktop wallpapers
 */

import { getAllWallpapers, getCurrentWallpaper, getCurrentIntensity, getCurrentPalette, setWallpaper, setIntensity, setColorPalette } from '../../services/wallpaper.js';
import { colorPalettes } from '../../config/wallpapers.js';

export function renderWallpaperWindow(container) {
  const wallpapers = getAllWallpapers();
  const current = getCurrentWallpaper() || wallpapers[0];
  const intensity = getCurrentIntensity();
  const palette = getCurrentPalette();

  const intensityLabels = ['Minimal', 'Very Low', 'Low', 'Medium-Low', 'Medium', 'Medium-High', 'High', 'Very High', 'Intense', 'Maximum'];

  container.innerHTML = `
    <div class="wallpaper-window" style="
      width: 100%;
      height: 100%;
      padding: 24px;
      overflow-y: auto;
      background: var(--bg-primary);
    ">
      <!-- Header -->
      <div class="wallpaper-header" style="margin-bottom: 24px;">
        <h2 style="
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          🎨 Desktop Background
        </h2>
        <p style="font-size: 14px; color: var(--text-secondary);">
          Choose from animated and static wallpapers
        </p>
      </div>

      <!-- Wallpaper Grid -->
      <div class="wallpapers-grid" style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
      ">
        ${wallpapers.map(wallpaper => `
          <div
            class="wallpaper-option ${current && current.id === wallpaper.id ? 'active' : ''}"
            data-wallpaper-id="${wallpaper.id}"
            style="
              position: relative;
              aspect-ratio: 1;
              border-radius: 12px;
              overflow: hidden;
              cursor: pointer;
              border: 2px solid ${current && current.id === wallpaper.id ? 'var(--color-primary, #8B5CF6)' : 'var(--border-color)'};
              background: var(--bg-secondary);
              transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            "
          >
            <!-- Preview -->
            <div class="wallpaper-preview" style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 48px;
              background: ${wallpaper.backgroundColor || '#0A0F1E'};
              ${wallpaper.type === 'css' ? `background-image: ${wallpaper.css};` : ''}
              background-size: cover;
              background-position: center;
            ">
              ${wallpaper.emoji}
            </div>

            <!-- Active Indicator -->
            ${current && current.id === wallpaper.id ? `
              <div class="active-indicator" style="
                position: absolute;
                top: 8px;
                right: 8px;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: var(--color-primary, #8B5CF6);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
              ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            ` : ''}

            <!-- Name Label -->
            <div class="wallpaper-label" style="
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 10px;
              background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
              color: white;
              font-size: 12px;
              font-weight: 500;
              text-align: center;
            ">
              ${wallpaper.name}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Settings Section -->
      <div class="wallpaper-settings" style="
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 20px;
      ">
        <h3 style="
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 20px;
        ">
          Customization
        </h3>

        <!-- Intensity Control -->
        <div class="control-group" style="margin-bottom: 24px;">
          <label class="control-label" style="
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text-secondary);
          ">
            ⚡ Animation Intensity
          </label>
          <div class="slider-container" style="
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <input
              type="range"
              id="intensitySlider"
              min="1"
              max="10"
              value="${intensity}"
              style="
                flex: 1;
                height: 4px;
                border-radius: 2px;
                background: var(--bg-tertiary, #2a2a2a);
                outline: none;
                -webkit-appearance: none;
                cursor: pointer;
              "
            >
            <span class="slider-value" id="intensityValue" style="
              font-size: 12px;
              color: var(--text-secondary);
              min-width: 90px;
              text-align: right;
            ">
              ${intensityLabels[intensity - 1]}
            </span>
          </div>
        </div>

        <!-- Color Palette Control -->
        <div class="control-group">
          <label class="control-label" style="
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text-secondary);
          ">
            🎨 Color Palette
          </label>
          <div class="color-palette" style="
            display: flex;
            gap: 10px;
          ">
            ${Object.entries(colorPalettes).map(([key, pal]) => `
              <div
                class="color-swatch ${palette === key ? 'active' : ''}"
                data-palette="${key}"
                style="
                  width: 44px;
                  height: 44px;
                  border-radius: 8px;
                  cursor: pointer;
                  border: 2px solid ${palette === key ? 'white' : 'transparent'};
                  background: ${pal.gradient};
                  transition: all 0.2s ease;
                  box-shadow: ${palette === key ? '0 0 0 3px rgba(255, 255, 255, 0.2)' : 'none'};
                "
                title="${pal.name}"
              ></div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="wallpaper-description" style="
        margin-top: 20px;
        padding: 16px;
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 10px;
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.6;
      ">
        <strong style="color: var(--text-primary);">ℹ️ About:</strong>
        <span id="wallpaperDescription">${current ? current.description : 'Select a wallpaper to see details'}</span>
      </div>
    </div>
  `;

  initWallpaperWindowInteractions();
}

function initWallpaperWindowInteractions() {
  // Wallpaper selection
  document.querySelectorAll('.wallpaper-option').forEach(option => {
    option.addEventListener('click', () => {
      const wallpaperId = option.dataset.wallpaperId;

      // Set wallpaper
      const success = setWallpaper(wallpaperId);

      if (success) {
        // Update UI
        document.querySelectorAll('.wallpaper-option').forEach(opt => {
          opt.classList.remove('active');
          opt.style.borderColor = 'var(--border-color)';
        });

        option.classList.add('active');
        option.style.borderColor = 'var(--color-primary, #8B5CF6)';

        // Update description
        const wallpapers = getAllWallpapers();
        const wallpaper = wallpapers.find(w => w.id === wallpaperId);
        if (wallpaper) {
          const desc = document.getElementById('wallpaperDescription');
          if (desc) desc.textContent = wallpaper.description;
        }

        showToast('Wallpaper changed successfully!', 'success');
      }
    });

    // Hover effects
    option.addEventListener('mouseenter', () => {
      if (!option.classList.contains('active')) {
        option.style.borderColor = 'rgba(139, 92, 246, 0.5)';
        option.style.transform = 'translateY(-4px) scale(1.02)';
        option.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
      }
    });

    option.addEventListener('mouseleave', () => {
      if (!option.classList.contains('active')) {
        option.style.borderColor = 'var(--border-color)';
        option.style.transform = '';
        option.style.boxShadow = '';
      }
    });
  });

  // Intensity slider
  const intensitySlider = document.getElementById('intensitySlider');
  const intensityValue = document.getElementById('intensityValue');

  if (intensitySlider) {
    intensitySlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      const labels = ['Minimal', 'Very Low', 'Low', 'Medium-Low', 'Medium', 'Medium-High', 'High', 'Very High', 'Intense', 'Maximum'];
      intensityValue.textContent = labels[value - 1];
      setIntensity(value);
    });
  }

  // Color palette swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const paletteKey = swatch.dataset.palette;

      // Set palette
      setColorPalette(paletteKey);

      // Update UI
      document.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.remove('active');
        s.style.borderColor = 'transparent';
        s.style.boxShadow = 'none';
      });

      swatch.classList.add('active');
      swatch.style.borderColor = 'white';
      swatch.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.2)';
    });

    // Hover effect
    swatch.addEventListener('mouseenter', () => {
      if (!swatch.classList.contains('active')) {
        swatch.style.transform = 'scale(1.1)';
      }
    });

    swatch.addEventListener('mouseleave', () => {
      swatch.style.transform = '';
    });
  });
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const colors = {
    success: '#10B981',
    error: '#EF4444',
    info: '#3B82F6'
  };

  toast.style.cssText = `
    background: rgba(24, 24, 27, 0.95);
    border: 1px solid ${colors[type]};
    border-radius: 12px;
    padding: 14px 18px;
    color: white;
    font-size: 14px;
    backdrop-filter: blur(20px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
    animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300)
  }, 3000);
}
