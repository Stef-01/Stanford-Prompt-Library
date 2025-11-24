/**
 * Upgrade System
 * Manages player upgrades and currency
 */

import { UPGRADES, getUpgradeCost, GAME_CONFIG } from '../config.js';

export class UpgradeSystem {
  constructor() {
    this.currency = 0;
    this.totalEarned = 0;
    this.upgrades = {
      fireRate: 0,
      damage: 0,
      multiShot: 0,
      shield: 0,
      speed: 0
    };
  }

  addCurrency(amount) {
    this.currency += amount;
    this.totalEarned += amount;
  }

  canAfford(upgradeKey) {
    const currentLevel = this.upgrades[upgradeKey];
    const cost = getUpgradeCost(upgradeKey, currentLevel);
    return this.currency >= cost && currentLevel < UPGRADES[upgradeKey].maxLevel;
  }

  purchaseUpgrade(upgradeKey) {
    if (!this.canAfford(upgradeKey)) return false;

    const currentLevel = this.upgrades[upgradeKey];
    const cost = getUpgradeCost(upgradeKey, currentLevel);

    this.currency -= cost;
    this.upgrades[upgradeKey]++;

    console.log(`[Upgrade] Purchased ${upgradeKey} level ${this.upgrades[upgradeKey]}`);
    return true;
  }

  getUpgradeLevel(upgradeKey) {
    return this.upgrades[upgradeKey];
  }

  getFireRate() {
    return UPGRADES.fireRate.effect(this.upgrades.fireRate);
  }

  getDamage() {
    return UPGRADES.damage.effect(this.upgrades.damage);
  }

  getMultiShotCount() {
    return UPGRADES.multiShot.effect(this.upgrades.multiShot);
  }

  getMaxShield() {
    return GAME_CONFIG.PLAYER_LIVES + UPGRADES.shield.effect(this.upgrades.shield);
  }

  getSpeed() {
    return UPGRADES.speed.effect(this.upgrades.speed);
  }

  getAllUpgrades() {
    return Object.keys(UPGRADES).map(key => ({
      key,
      ...UPGRADES[key],
      currentLevel: this.upgrades[key],
      cost: getUpgradeCost(key, this.upgrades[key]),
      canAfford: this.canAfford(key)
    }));
  }

  reset() {
    // Keep half the currency on game over
    this.currency = Math.floor(this.currency / 2);
    // Upgrades persist between games
  }
}
