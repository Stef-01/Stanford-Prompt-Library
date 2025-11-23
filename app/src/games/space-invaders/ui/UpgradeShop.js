/**
 * Upgrade Shop UI
 */

export function renderUpgradeShop(gameState) {
  const { upgrades, currency } = gameState;

  return `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      background: rgba(0, 31, 91, 0.98);
      color: white;
      z-index: 100;
      overflow-y: auto;
    ">
      <!-- Header -->
      <div style="
        padding: 20px;
        background: rgba(0, 0, 0, 0.5);
        border-bottom: 2px solid #fdb515;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 28px; margin: 0; color: #fdb515; text-shadow: 0 0 10px #fdb515;">
            ⚡ UPGRADE SHOP
          </h2>
          <div style="font-size: 24px; font-weight: bold; color: #fdb515;">
            💰 ${currency}
          </div>
        </div>
      </div>

      <!-- Upgrade Grid -->
      <div style="
        flex: 1;
        padding: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 15px;
        align-content: start;
      ">
        ${upgrades.map(upgrade => `
          <div class="upgrade-card" style="
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid ${upgrade.canAfford ? '#8B5CF6' : 'rgba(255, 255, 255, 0.2)'};
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            ${upgrade.currentLevel >= upgrade.maxLevel ? 'opacity: 0.6;' : ''}
          ">
            <!-- Icon and Name -->
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="font-size: 32px;">${upgrade.icon}</div>
              <div>
                <div style="font-size: 18px; font-weight: bold;">${upgrade.name}</div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">
                  ${upgrade.description}
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">
                <span>Level ${upgrade.currentLevel}/${upgrade.maxLevel}</span>
              </div>
              <div style="
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
              ">
                <div style="
                  width: ${(upgrade.currentLevel / upgrade.maxLevel) * 100}%;
                  height: 100%;
                  background: linear-gradient(90deg, #8B5CF6, #3B82F6);
                  transition: width 0.3s ease;
                "></div>
              </div>
            </div>

            <!-- Purchase Button -->
            ${upgrade.currentLevel >= upgrade.maxLevel ? `
              <div style="
                padding: 10px;
                text-align: center;
                background: rgba(0, 255, 0, 0.2);
                border: 1px solid #00FF41;
                border-radius: 6px;
                color: #00FF41;
                font-weight: bold;
              ">
                ✓ MAXED OUT
              </div>
            ` : `
              <button
                class="upgrade-btn"
                data-upgrade="${upgrade.key}"
                ${!upgrade.canAfford ? 'disabled' : ''}
                style="
                  width: 100%;
                  padding: 12px;
                  font-size: 16px;
                  font-weight: bold;
                  background: ${upgrade.canAfford ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)'};
                  color: ${upgrade.canAfford ? 'white' : 'rgba(255, 255, 255, 0.4)'};
                  border: 2px solid ${upgrade.canAfford ? 'white' : 'rgba(255, 255, 255, 0.2)'};
                  border-radius: 8px;
                  cursor: ${upgrade.canAfford ? 'pointer' : 'not-allowed'};
                  transition: all 0.2s ease;
                "
              >
                ${upgrade.canAfford ? 'PURCHASE' : 'INSUFFICIENT FUNDS'} - ${upgrade.cost} 💰
              </button>
            `}
          </div>
        `).join('')}
      </div>

      <!-- Footer -->
      <div style="
        padding: 20px;
        background: rgba(0, 0, 0, 0.5);
        border-top: 2px solid #8B5CF6;
        display: flex;
        justify-content: center;
      ">
        <button id="close-shop-btn" style="
          padding: 12px 40px;
          font-size: 18px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
        ">
          CLOSE SHOP (ESC)
        </button>
      </div>
    </div>
  `;
}
