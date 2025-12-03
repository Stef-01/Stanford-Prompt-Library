/**
 * Game HUD (Heads-Up Display)
 * Shows score, lives, currency, wave info
 */

export function renderGameHUD(gameState) {
  const { score, wave, lives, maxLives, currency, weapon } = gameState;

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
      <!-- Exit Button -->
      <button id="exit-game-btn" class="exit-game-btn" style="
        position: absolute;
        top: 10px;
        right: 10px;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        pointer-events: auto;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 1;
        z-index: 1000;
      ">
        ✕
      </button>

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
        <div style="text-align: right; padding-right: 45px;">
          <div style="font-size: 18px; font-weight: bold; color: #fdb515; text-shadow: 0 0 8px #fdb515;">
            💰 ${currency}
          </div>
          <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 2px;">
            Press U to upgrade
          </div>
        </div>
      </div>

      <!-- Weapon Indicator -->
      ${weapon ? `
        <div style="
          margin-top: 10px;
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.6);
          border-left: 3px solid ${weapon.color};
          border-radius: 4px;
          display: inline-block;
        ">
          <div style="
            font-size: 14px;
            font-weight: bold;
            color: ${weapon.color};
            text-shadow: 0 0 8px ${weapon.color};
          ">
            ⚔️ ${weapon.name}
          </div>
          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.6); margin-top: 2px;">
            Press 1-6 to switch weapons
          </div>
        </div>
      ` : ''}
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
      background: rgba(10, 15, 30, 0.98);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: white;
      z-index: 100;
    ">
      <h1 style="
        font-size: 56px;
        margin-bottom: 8px;
        background: linear-gradient(135deg, #fdb515, #f4a300);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 800;
        letter-spacing: 2px;
      ">
        BEAR INVADERS
      </h1>
      <div style="font-size: 36px; margin-bottom: 16px;">🐻</div>
      <p style="
        font-size: 16px;
        margin-bottom: 48px;
        color: rgba(255, 255, 255, 0.6);
        max-width: 400px;
        text-align: center;
        line-height: 1.6;
      ">
        Defend against the golden bear invasion! Earn coins, upgrade your ship, and survive the waves.
      </p>

      <button id="start-game-btn" style="
        padding: 16px 48px;
        font-size: 18px;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.05);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        letter-spacing: 1px;
      ">
        START GAME
      </button>

      <div style="
        margin-top: 64px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        text-align: left;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.5);
        font-family: monospace;
        padding: 24px 32px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
      ">
        <div><span style="color: rgba(255, 255, 255, 0.8);">Move:</span> ← → / A D</div>
        <div><span style="color: rgba(255, 255, 255, 0.8);">Shoot:</span> SPACE</div>
        <div><span style="color: rgba(255, 255, 255, 0.8);">Weapons:</span> 1 2 3 4 5 6</div>
        <div><span style="color: rgba(255, 255, 255, 0.8);">Shop:</span> U</div>
        <div><span style="color: rgba(255, 255, 255, 0.8);">Pause:</span> ESC</div>
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
      background: rgba(10, 15, 30, 0.95);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: white;
      z-index: 100;
    ">
      <h2 style="
        font-size: 42px;
        margin-bottom: 32px;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 700;
        letter-spacing: 4px;
      ">
        PAUSED
      </h2>
      <button id="resume-game-btn" style="
        padding: 14px 40px;
        font-size: 16px;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.05);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        letter-spacing: 1px;
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
      background: rgba(10, 15, 30, 0.98);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: white;
      z-index: 100;
    ">
      <h2 style="
        font-size: 52px;
        margin-bottom: 32px;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 800;
        letter-spacing: 3px;
      ">
        GAME OVER
      </h2>
      <div style="
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 48px;
        padding: 32px 48px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
      ">
        <div style="
          font-size: 20px;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          justify-content: space-between;
          gap: 40px;
        ">
          <span>Final Score:</span>
          <span style="
            font-weight: 700;
            background: linear-gradient(135deg, #00FF41, #00DD35);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">${score}</span>
        </div>
        <div style="
          font-size: 16px;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          justify-content: space-between;
          gap: 40px;
        ">
          <span>Currency Kept:</span>
          <span style="color: #fdb515; font-weight: 600;">💰 ${Math.floor(currency / 2)}</span>
        </div>
      </div>
      <button id="restart-game-btn" style="
        padding: 16px 48px;
        font-size: 18px;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.05);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        letter-spacing: 1px;
      ">
        PLAY AGAIN
      </button>
    </div>
  `;
}
