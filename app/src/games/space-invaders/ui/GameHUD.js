/**
 * Game HUD (Heads-Up Display)
 * Shows score, lives, currency, wave info
 */

export function renderGameHUD(gameState) {
  const { score, wave, lives, maxLives, currency } = gameState;

  return `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 15px 20px;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
      color: white;
      font-family: 'Courier New', monospace;
      pointer-events: none;
      z-index: 10;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <!-- Left: Score and Wave -->
        <div>
          <div style="font-size: 20px; font-weight: bold; color: #00FF41; text-shadow: 0 0 10px #00FF41;">
            SCORE: ${score.toString().padStart(6, '0')}
          </div>
          <div style="font-size: 14px; color: #fdb515; margin-top: 4px;">
            WAVE ${wave}
          </div>
        </div>

        <!-- Center: Lives -->
        <div style="display: flex; gap: 6px; align-items: center;">
          <span style="font-size: 14px; margin-right: 4px;">❤️</span>
          ${Array(maxLives).fill(0).map((_, i) => `
            <div style="
              width: 20px;
              height: 20px;
              border-radius: 4px;
              background: ${i < lives ? '#8B5CF6' : 'rgba(255, 255, 255, 0.2)'};
              box-shadow: ${i < lives ? '0 0 8px #8B5CF6' : 'none'};
              transition: all 0.3s ease;
            "></div>
          `).join('')}
        </div>

        <!-- Right: Currency -->
        <div style="text-align: right;">
          <div style="font-size: 18px; font-weight: bold; color: #fdb515; text-shadow: 0 0 8px #fdb515;">
            💰 ${currency}
          </div>
          <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 2px;">
            Press U to upgrade
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderMenuOverlay() {
  return `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(0, 31, 91, 0.95);
      color: white;
      z-index: 100;
    ">
      <h1 style="
        font-size: 48px;
        margin-bottom: 10px;
        color: #fdb515;
        text-shadow: 0 0 20px #fdb515;
        font-family: 'Courier New', monospace;
      ">
        🐻 BEAR INVADERS 🐻
      </h1>
      <p style="font-size: 18px; margin-bottom: 40px; color: rgba(255, 255, 255, 0.8);">
        Defend against the smiley bear invasion!
      </p>

      <button id="start-game-btn" style="
        padding: 15px 40px;
        font-size: 20px;
        background: #8B5CF6;
        color: white;
        border: 2px solid white;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
      ">
        START GAME
      </button>

      <div style="margin-top: 40px; text-align: center; font-size: 14px; color: rgba(255, 255, 255, 0.6); font-family: monospace;">
        <div>← → or A D: Move</div>
        <div>SPACE: Shoot</div>
        <div>U: Upgrade Shop</div>
        <div>ESC: Pause</div>
      </div>
    </div>
  `;
}

export function renderPausedOverlay() {
  return `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      z-index: 100;
    ">
      <h2 style="font-size: 36px; margin-bottom: 20px; color: #00FF41;">PAUSED</h2>
      <button id="resume-game-btn" style="
        padding: 12px 30px;
        font-size: 18px;
        background: #8B5CF6;
        color: white;
        border: 2px solid white;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
      ">
        RESUME
      </button>
    </div>
  `;
}

export function renderGameOverOverlay(score, currency) {
  return `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      z-index: 100;
    ">
      <h2 style="font-size: 48px; margin-bottom: 20px; color: #ff4444; text-shadow: 0 0 20px #ff4444;">
        GAME OVER
      </h2>
      <div style="font-size: 24px; margin-bottom: 10px; color: #00FF41;">
        Final Score: ${score}
      </div>
      <div style="font-size: 18px; margin-bottom: 40px; color: #fdb515;">
        Currency Kept: ${Math.floor(currency / 2)} 💰
      </div>
      <button id="restart-game-btn" style="
        padding: 15px 40px;
        font-size: 20px;
        background: #8B5CF6;
        color: white;
        border: 2px solid white;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
      ">
        PLAY AGAIN
      </button>
    </div>
  `;
}
