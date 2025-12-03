/**
 * Placeholder Windows
 * These are placeholder windows for features to be implemented in the future
 */

import { initSpaceInvaders } from '../../games/space-invaders/SpaceInvaders.js';

// Track game cleanup function
let gameCleanup = null;

/**
 * Render Games Window - Game Selection Menu
 */
export function renderGamesWindow(contentContainer) {
  console.log('[GamesWindow] Rendering game selection menu');

  // Clean up previous game instance if exists
  if (gameCleanup) {
    gameCleanup();
    gameCleanup = null;
  }

  // Clear container
  contentContainer.innerHTML = '';
  contentContainer.style.padding = '40px';
  contentContainer.style.overflow = 'auto';

  // Show game selection menu
  renderGameSelectionMenu(contentContainer);
}

/**
 * Render Game Selection Menu
 */
function renderGameSelectionMenu(contentContainer) {
  contentContainer.innerHTML = `
    <div style="text-align: center; max-width: 800px; margin: 0 auto;">
      <div style="font-size: 64px; margin-bottom: 20px;">🎮</div>
      <h2 style="font-size: 32px; margin-bottom: 15px; color: var(--text-primary); font-weight: 700;">
        Stanford Games
      </h2>
      <p style="color: var(--text-secondary); margin-bottom: 40px; font-size: 16px;">
        Choose a game to play
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <!-- Bear Invaders -->
        <div
          id="game-bear-invaders"
          class="game-card"
          style="
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 146, 60, 0.1));
            border: 2px solid rgba(251, 191, 36, 0.3);
            border-radius: 16px;
            padding: 30px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            text-align: center;
          "
        >
          <div style="font-size: 72px; margin-bottom: 15px;">🐻</div>
          <h3 style="font-size: 24px; margin-bottom: 10px; color: #fdb515; font-weight: 700;">
            Bear Invaders
          </h3>
          <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5;">
            Defend against the golden bear invasion! Upgrade your ship with 6 unique weapons and survive the waves.
          </p>
          <div style="
            display: inline-block;
            padding: 10px 24px;
            background: rgba(251, 191, 36, 0.2);
            border: 1px solid rgba(251, 191, 36, 0.4);
            border-radius: 8px;
            color: #fdb515;
            font-size: 14px;
            font-weight: 600;
          ">
            PLAY NOW
          </div>
        </div>

        <!-- Stanford Simulator -->
        <div
          id="game-stanford-sim"
          class="game-card"
          style="
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1));
            border: 2px solid rgba(139, 92, 246, 0.3);
            border-radius: 16px;
            padding: 30px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            text-align: center;
            opacity: 0.7;
          "
        >
          <div style="font-size: 72px; margin-bottom: 15px;">🎓</div>
          <h3 style="font-size: 24px; margin-bottom: 10px; color: var(--accent-purple); font-weight: 700;">
            Stanford Simulator
          </h3>
          <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5;">
            Experience life at Stanford! Navigate classes, activities, and campus adventures.
          </p>
          <div style="
            display: inline-block;
            padding: 10px 24px;
            background: rgba(139, 92, 246, 0.2);
            border: 1px solid rgba(139, 92, 246, 0.4);
            border-radius: 8px;
            color: var(--accent-purple);
            font-size: 14px;
            font-weight: 600;
          ">
            COMING SOON
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners
  const bearInvadersCard = contentContainer.querySelector('#game-bear-invaders');
  const stanfordSimCard = contentContainer.querySelector('#game-stanford-sim');

  if (bearInvadersCard) {
    bearInvadersCard.addEventListener('click', () => {
      launchBearInvaders(contentContainer);
    });

    bearInvadersCard.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.transform = 'translateY(-8px)';
      e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.6)';
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(251, 191, 36, 0.2)';
    });

    bearInvadersCard.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)';
      e.currentTarget.style.boxShadow = '';
    });
  }

  if (stanfordSimCard) {
    stanfordSimCard.addEventListener('mouseenter', (e) => {
      e.currentTarget.style.opacity = '0.8';
    });

    stanfordSimCard.addEventListener('mouseleave', (e) => {
      e.currentTarget.style.opacity = '0.7';
    });
  }
}

/**
 * Launch Bear Invaders game
 */
function launchBearInvaders(contentContainer) {
  console.log('[GamesWindow] Launching Bear Invaders');

  // Clear container
  contentContainer.innerHTML = '';
  contentContainer.style.padding = '0';
  contentContainer.style.overflow = 'hidden';

  // Create back button container
  const backButtonContainer = document.createElement('div');
  backButtonContainer.style.cssText = `
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
  `;

  const backButton = document.createElement('button');
  backButton.id = 'back-to-menu-btn';
  backButton.textContent = '← Back';
  backButton.style.cssText = `
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  `;

  backButton.addEventListener('click', () => {
    // Clean up game
    if (gameCleanup) {
      gameCleanup();
      gameCleanup = null;
    }
    // Return to menu
    contentContainer.innerHTML = '';
    contentContainer.style.padding = '40px';
    contentContainer.style.overflow = 'auto';
    renderGameSelectionMenu(contentContainer);
  });

  backButton.addEventListener('mouseenter', () => {
    backButton.style.background = 'rgba(0, 0, 0, 0.9)';
    backButton.style.borderColor = 'rgba(255, 255, 255, 0.5)';
  });

  backButton.addEventListener('mouseleave', () => {
    backButton.style.background = 'rgba(0, 0, 0, 0.7)';
    backButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
  });

  backButtonContainer.appendChild(backButton);
  contentContainer.appendChild(backButtonContainer);

  // Initialize Space Invaders
  gameCleanup = initSpaceInvaders(contentContainer);

  // Store cleanup function for when window closes
  contentContainer.dataset.cleanup = 'true';
}

/**
 * Cleanup Games Window
 */
export function cleanupGamesWindow() {
  if (gameCleanup) {
    gameCleanup();
    gameCleanup = null;
  }
}

/**
 * Render Learn Window - Placeholder for educational resources
 */
export function renderLearnWindow(contentContainer) {
  contentContainer.innerHTML = `
    <div style="padding: 40px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 20px;">📚</div>
      <h2 style="font-size: 24px; margin-bottom: 15px; color: var(--text-primary);">Learn Prompt Engineering</h2>
      <p style="color: var(--text-secondary); margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.6;">
        Coming soon! Access tutorials, best practices, and courses on prompt engineering and AI interaction.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; max-width: 700px; margin: 0 auto;">
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: left;">
          <div style="font-size: 32px; margin-bottom: 10px;">🎓</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Beginner Tutorials</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">Learn the basics of prompt engineering</p>
          <span style="font-size: 11px; color: var(--accent-blue);">6 lessons planned</span>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: left;">
          <div style="font-size: 32px; margin-bottom: 10px;">🚀</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Advanced Techniques</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">Master complex prompting strategies</p>
          <span style="font-size: 11px; color: var(--accent-purple);">Coming soon</span>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: left;">
          <div style="font-size: 32px; margin-bottom: 10px;">💼</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Use Cases</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">Real-world applications and examples</p>
          <span style="font-size: 11px; color: var(--accent-green);">12+ examples</span>
        </div>
      </div>

      <div style="margin-top: 40px; padding: 20px; background: rgba(168, 85, 247, 0.1); border: 1px solid var(--accent-purple); border-radius: 12px; max-width: 500px; margin-left: auto; margin-right: auto;">
        <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">
          <strong style="color: var(--accent-purple);">📖 Meanwhile...</strong><br/>
          Browse our prompt library to learn from real examples!
        </p>
      </div>
    </div>
  `
}

/**
 * Render Opportunities Window - Placeholder for job board and collaborations
 */
export function renderOpportunitiesWindow(contentContainer) {
  contentContainer.innerHTML = `
    <div style="padding: 40px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 20px;">💼</div>
      <h2 style="font-size: 24px; margin-bottom: 15px; color: var(--text-primary);">Opportunities & Collaboration</h2>
      <p style="color: var(--text-secondary); margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.6;">
        Coming soon! Find research opportunities, internships, and collaboration projects in the AI space.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; max-width: 700px; margin: 0 auto;">
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: left;">
          <div style="font-size: 32px; margin-bottom: 10px;">🔬</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Research Projects</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">Join AI research initiatives at Stanford</p>
          <span style="font-size: 11px; color: var(--accent-blue);">Coming soon</span>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: left;">
          <div style="font-size: 32px; margin-bottom: 10px;">👥</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Team Formation</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">Find collaborators for hackathons and projects</p>
          <span style="font-size: 11px; color: var(--accent-green);">Coming soon</span>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: left;">
          <div style="font-size: 32px; margin-bottom: 10px;">💰</div>
          <h3 style="font-size: 16px; margin-bottom: 5px; color: var(--text-primary);">Internships & Jobs</h3>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">AI-focused career opportunities</p>
          <span style="font-size: 11px; color: var(--accent-purple);">Coming soon</span>
        </div>
      </div>

      <div style="margin-top: 40px; padding: 20px; background: rgba(34, 197, 94, 0.1); border: 1px solid var(--accent-green); border-radius: 12px; max-width: 500px; margin-left: auto; margin-right: auto;">
        <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">
          <strong style="color: var(--accent-green);">🌟 Want to post an opportunity?</strong><br/>
          Contact us to feature your AI project or job posting!
        </p>
      </div>
    </div>
  `
}

/**
 * Render Settings Window - Placeholder for user preferences
 */
export function renderSettingsWindow(contentContainer, userData) {
  contentContainer.innerHTML = `
    <div style="padding: 40px; overflow-y: auto; height: 100%;">
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 24px; margin-bottom: 10px; color: var(--text-primary);">⚙️ Settings</h2>
        <p style="color: var(--text-secondary); font-size: 14px;">Manage your account and appearance preferences</p>
      </div>

      <!-- Account Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; margin-bottom: 15px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Account</h3>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Display Name</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${escapeHtml(userData?.display_name || 'User')}</div>
            </div>
            <button disabled style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: none; border-radius: 6px; color: var(--text-secondary); font-size: 12px; cursor: not-allowed;">Coming Soon</button>
          </div>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Email</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${escapeHtml(userData?.email || 'email@stanford.edu')}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; margin-bottom: 15px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Notifications</h3>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Email Notifications</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Get notified about prompt approvals</div>
            </div>
            <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
              <input type="checkbox" disabled style="opacity: 0; width: 0; height: 0;">
              <span style="position: absolute; cursor: not-allowed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.2); border-radius: 24px; transition: 0.4s;"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Wallpaper Section -->
      <div id="wallpaper-settings-section" style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; margin-bottom: 15px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">🎨 Desktop Wallpaper</h3>
        <div id="wallpaper-settings-content">
          <!-- Wallpaper UI will be injected here -->
        </div>
      </div>

      <!-- Appearance Section -->
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px; margin-bottom: 15px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">Appearance</h3>

        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">Theme</div>
              <div style="font-size: 12px; color: var(--text-secondary);">Currently: Dark Mode</div>
            </div>
            <button disabled style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border: none; border-radius: 6px; color: var(--text-secondary); font-size: 12px; cursor: not-allowed;">Coming Soon</button>
          </div>
        </div>
      </div>

      <!-- Info -->
      <div style="padding: 20px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; text-align: center;">
        <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">
          More settings coming soon! 🚀
        </p>
      </div>
    </div>
  `

  // Load wallpaper settings
  loadWallpaperSettings()
}

/**
 * Load wallpaper settings into settings window
 */
function loadWallpaperSettings() {
  // Dynamically import wallpaper functions
  import('../../services/wallpaper.js').then(wallpaperModule => {
    import('../../config/wallpapers.js').then(configModule => {
      const container = document.getElementById('wallpaper-settings-content')
      if (!container) return

      const { getAllWallpapers, getCurrentWallpaper, getCurrentIntensity, getCurrentPalette, setWallpaper, setIntensity, setColorPalette } = wallpaperModule
      const { colorPalettes } = configModule

      const wallpapers = getAllWallpapers()
      const current = getCurrentWallpaper() || wallpapers[0]
      const intensity = getCurrentIntensity()
      const palette = getCurrentPalette()

      const intensityLabels = ['Minimal', 'Very Low', 'Low', 'Medium-Low', 'Medium', 'Medium-High', 'High', 'Very High', 'Intense', 'Maximum']

      container.innerHTML = `
        <!-- Wallpaper Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; margin-bottom: 24px;">
          ${wallpapers.map(wallpaper => `
            <div
              class="wallpaper-option-settings"
              data-wallpaper-id="${wallpaper.id}"
              style="
                position: relative;
                aspect-ratio: 1;
                border-radius: 10px;
                overflow: hidden;
                cursor: pointer;
                border: 2px solid ${current && current.id === wallpaper.id ? 'var(--color-primary, #8B5CF6)' : 'var(--border-color)'};
                background: var(--bg-secondary);
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
              "
            >
              <div style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                background: ${wallpaper.backgroundColor || '#0A0F1E'};
              ">
                ${wallpaper.emoji}
              </div>
              ${current && current.id === wallpaper.id ? `
                <div style="
                  position: absolute;
                  top: 6px;
                  right: 6px;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: var(--color-primary, #8B5CF6);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
                ">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4">
                    <path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              ` : ''}
              <div style="
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 6px;
                background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
                color: white;
                font-size: 10px;
                font-weight: 500;
                text-align: center;
              ">
                ${wallpaper.name}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Intensity Control -->
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; margin-bottom: 12px;">
          <div style="margin-bottom: 8px;">
            <span style="font-size: 13px; color: var(--text-primary); font-weight: 500;">⚡ Animation Intensity</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <input
              type="range"
              id="intensity-slider-settings"
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
            <span id="intensity-value-settings" style="
              font-size: 11px;
              color: var(--text-secondary);
              min-width: 80px;
              text-align: right;
            ">
              ${intensityLabels[intensity - 1]}
            </span>
          </div>
        </div>

        <!-- Color Palette Control -->
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px;">
          <div style="margin-bottom: 10px;">
            <span style="font-size: 13px; color: var(--text-primary); font-weight: 500;">🎨 Color Palette</span>
          </div>
          <div style="display: flex; gap: 8px;">
            ${Object.entries(colorPalettes).map(([key, pal]) => `
              <div
                class="color-swatch-settings"
                data-palette="${key}"
                style="
                  width: 40px;
                  height: 40px;
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
      `

      // Add event listeners
      document.querySelectorAll('.wallpaper-option-settings').forEach(option => {
        option.addEventListener('click', () => {
          const wallpaperId = option.dataset.wallpaperId
          const success = setWallpaper(wallpaperId)
          if (success) {
            // Reload wallpaper settings to update UI
            loadWallpaperSettings()
          }
        })

        option.addEventListener('mouseenter', () => {
          if (!option.querySelector('svg')) {
            option.style.borderColor = 'rgba(139, 92, 246, 0.5)'
            option.style.transform = 'scale(1.05)'
          }
        })

        option.addEventListener('mouseleave', () => {
          if (!option.querySelector('svg')) {
            option.style.borderColor = 'var(--border-color)'
            option.style.transform = ''
          }
        })
      })

      const intensitySlider = document.getElementById('intensity-slider-settings')
      const intensityValue = document.getElementById('intensity-value-settings')

      if (intensitySlider) {
        intensitySlider.addEventListener('input', (e) => {
          const value = parseInt(e.target.value)
          intensityValue.textContent = intensityLabels[value - 1]
          setIntensity(value)
        })
      }

      document.querySelectorAll('.color-swatch-settings').forEach(swatch => {
        swatch.addEventListener('click', () => {
          const paletteKey = swatch.dataset.palette
          setColorPalette(paletteKey)
          loadWallpaperSettings()
        })

        swatch.addEventListener('mouseenter', () => {
          if (swatch.style.borderColor === 'transparent') {
            swatch.style.transform = 'scale(1.1)'
          }
        })

        swatch.addEventListener('mouseleave', () => {
          swatch.style.transform = ''
        })
      })
    })
  }).catch(error => {
    console.error('Error loading wallpaper settings:', error)
    const container = document.getElementById('wallpaper-settings-content')
    if (container) {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
          <p>Unable to load wallpaper settings</p>
        </div>
      `
    }
  })
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
