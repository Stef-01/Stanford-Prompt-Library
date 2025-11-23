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
      background: rgba(10, 15, 30, 0.98);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: white;
      z-index: 100;
      overflow-y: auto;
    ">
      <!-- Header -->
      <div style="
        padding: 24px 32px;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="
            font-size: 28px;
            margin: 0;
            font-weight: 700;
            letter-spacing: 1px;
            color: rgba(255, 255, 255, 0.9);
          ">
            ⚡ UPGRADE SHOP
          </h2>
          <div style="
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(135deg, #fdb515, #f4a300);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">
            💰 ${currency}
          </div>
        </div>
      </div>

      <!-- Upgrade Grid -->
      <div style="
        flex: 1;
        padding: 32px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        align-content: start;
      ">
        ${upgrades.map(upgrade => `
          <div class="upgrade-card" style="
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid ${upgrade.canAfford ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
            border-radius: 16px;
            padding: 24px;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            ${upgrade.currentLevel >= upgrade.maxLevel ? 'opacity: 0.5;' : ''}
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
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
            <div style="margin-bottom: 16px;">
              <div style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
                font-weight: 500;
              ">
                <span>Level ${upgrade.currentLevel}/${upgrade.maxLevel}</span>
              </div>
              <div style="
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 3px;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.1);
              ">
                <div style="
                  width: ${(upgrade.currentLevel / upgrade.maxLevel) * 100}%;
                  height: 100%;
                  background: linear-gradient(90deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2));
                  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                "></div>
              </div>
            </div>

            <!-- Purchase Button -->
            ${upgrade.currentLevel >= upgrade.maxLevel ? `
              <div style="
                padding: 12px;
                text-align: center;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                color: rgba(255, 255, 255, 0.6);
                font-weight: 600;
                font-size: 14px;
                letter-spacing: 1px;
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
                  padding: 14px;
                  font-size: 14px;
                  font-weight: 600;
                  letter-spacing: 0.5px;
                  background: ${upgrade.canAfford ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)'};
                  color: ${upgrade.canAfford ? 'white' : 'rgba(255, 255, 255, 0.3)'};
                  border: 1px solid ${upgrade.canAfford ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
                  border-radius: 10px;
                  cursor: ${upgrade.canAfford ? 'pointer' : 'not-allowed'};
                  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                  backdrop-filter: blur(10px);
                  -webkit-backdrop-filter: blur(10px);
                "
              >
                ${upgrade.canAfford ? `<span style="color: #fdb515;">💰 ${upgrade.cost}</span> - PURCHASE` : 'INSUFFICIENT FUNDS'}
              </button>
            `}
          </div>
        `).join('')}
      </div>

      <!-- Footer -->
      <div style="
        padding: 24px 32px;
        background: rgba(255, 255, 255, 0.03);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: center;
      ">
        <button id="close-shop-btn" style="
          padding: 14px 48px;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 1px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        ">
          CLOSE SHOP (ESC)
        </button>
      </div>
    </div>
  `;
}
