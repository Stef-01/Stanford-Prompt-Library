/**
 * Space Invaders - Main Game Component
 * Integrates game engine with UI
 */

import { GameEngine } from './GameEngine.js';
import { renderGameHUD, renderMenuOverlay, renderPausedOverlay, renderGameOverOverlay } from './ui/GameHUD.js';
import { renderUpgradeShop } from './ui/UpgradeShop.js';

export function initSpaceInvaders(container) {
  console.log('[SpaceInvaders] Initializing game');

  // Create game canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'space-invaders-canvas';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.style.background = '#001f5b';

  // Create UI overlay container
  const uiContainer = document.createElement('div');
  uiContainer.id = 'space-invaders-ui';
  uiContainer.style.position = 'absolute';
  uiContainer.style.top = '0';
  uiContainer.style.left = '0';
  uiContainer.style.right = '0';
  uiContainer.style.bottom = '0';
  uiContainer.style.pointerEvents = 'none';

  // Create game wrapper
  const gameWrapper = document.createElement('div');
  gameWrapper.style.position = 'relative';
  gameWrapper.style.width = '800px';
  gameWrapper.style.height = '600px';
  gameWrapper.style.margin = '0 auto';
  gameWrapper.appendChild(canvas);
  gameWrapper.appendChild(uiContainer);

  // Clear container and add game
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.height = '100%';
  container.style.overflow = 'auto';
  container.appendChild(gameWrapper);

  // Initialize game engine
  const game = new GameEngine(canvas);

  // Setup UI update handler
  game.onStateChange = (gameState) => {
    updateUI(gameState, game, uiContainer);
  };

  game.onScoreUpdate = (scoreData) => {
    // Update HUD in real-time
    if (game.state === 'playing') {
      const hudElement = uiContainer.querySelector('.game-hud');
      if (hudElement) {
        const scoreElement = hudElement.querySelector('.score-display');
        if (scoreElement) {
          scoreElement.textContent = scoreData.score.toString().padStart(6, '0');
        }
        const currencyElement = hudElement.querySelector('.currency-display');
        if (currencyElement) {
          currencyElement.textContent = scoreData.currency;
        }
      }
    }
  };

  // Initialize game
  game.init();

  // Return cleanup function
  return () => {
    game.cleanup();
  };
}

function updateUI(gameState, game, container) {
  console.log('[SpaceInvaders] UI update:', gameState.state);

  // Clear existing UI
  container.innerHTML = '';
  container.style.pointerEvents = 'none';

  switch (gameState.state) {
    case 'menu':
      container.innerHTML = renderMenuOverlay();
      container.style.pointerEvents = 'auto';

      const startBtn = container.querySelector('#start-game-btn');
      if (startBtn) {
        startBtn.addEventListener('click', () => game.startGame());
        startBtn.addEventListener('mouseenter', (e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        });
        startBtn.addEventListener('mouseleave', (e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
      }
      break;

    case 'playing':
      const hudHTML = renderGameHUD(gameState);
      const hudDiv = document.createElement('div');
      hudDiv.className = 'game-hud';
      hudDiv.innerHTML = hudHTML;
      container.appendChild(hudDiv);

      // Add exit button event listener
      const exitBtn = container.querySelector('#exit-game-btn');
      if (exitBtn) {
        exitBtn.addEventListener('click', () => {
          game.cleanup();
          // Trigger window close
          const windowElement = document.querySelector('[data-window-id="games"]');
          if (windowElement) {
            const closeBtn = windowElement.querySelector('.window-close-btn');
            if (closeBtn) closeBtn.click();
          }
        });
      }
      break;

    case 'paused':
      container.innerHTML = renderGameHUD(gameState) + renderPausedOverlay();
      container.style.pointerEvents = 'auto';

      const resumeBtn = container.querySelector('#resume-game-btn');
      if (resumeBtn) {
        resumeBtn.addEventListener('click', () => game.resume());
      }
      break;

    case 'shop':
      container.innerHTML = renderGameHUD(gameState) + renderUpgradeShop(gameState);
      container.style.pointerEvents = 'auto';

      // Setup upgrade buttons
      const upgradeButtons = container.querySelectorAll('.upgrade-btn');
      upgradeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const upgradeKey = e.target.dataset.upgrade;
          const success = game.purchaseUpgrade(upgradeKey);

          if (success) {
            // Visual feedback
            e.target.style.background = '#00FF41';
            e.target.textContent = '✓ PURCHASED!';
            setTimeout(() => {
              // Refresh shop UI
              game.notifyStateChange();
            }, 500);
          }
        });

        btn.addEventListener('mouseenter', (e) => {
          if (!e.target.disabled) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.background = 'rgba(255, 255, 255, 0.12)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          }
        });

        btn.addEventListener('mouseleave', (e) => {
          if (!e.target.disabled) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }
        });
      });

      const closeShopBtn = container.querySelector('#close-shop-btn');
      if (closeShopBtn) {
        closeShopBtn.addEventListener('click', () => game.resume());
        closeShopBtn.addEventListener('mouseenter', (e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        });
        closeShopBtn.addEventListener('mouseleave', (e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
      }
      break;

    case 'gameOver':
      container.innerHTML = renderGameOverOverlay(gameState.score, gameState.currency);
      container.style.pointerEvents = 'auto';

      const restartBtn = container.querySelector('#restart-game-btn');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => game.startGame());
        restartBtn.addEventListener('mouseenter', (e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        });
        restartBtn.addEventListener('mouseleave', (e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.background = 'rgba(255, 255, 255, 0.05)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
      }
      break;
  }
}
