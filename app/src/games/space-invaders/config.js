/**
 * Space Invaders - Game Configuration
 * Constants and wave formations for the game
 */

// Bear formation wave pattern (Grid width 40, height 25)
export const BEAR_WAVE = [
  { x: 14, y: 7 }, { x: 15, y: 7 }, { x: 16, y: 7 }, { x: 17, y: 7 },
  { x: 20, y: 7 }, { x: 21, y: 7 }, { x: 22, y: 7 }, { x: 23, y: 7 }, { x: 24, y: 7 },
  { x: 12, y: 8 }, { x: 13, y: 8 }, { x: 14, y: 8 }, { x: 15, y: 8 }, { x: 16, y: 8 },
  { x: 17, y: 8 }, { x: 18, y: 8 }, { x: 19, y: 8 }, { x: 20, y: 8 }, { x: 21, y: 8 },
  { x: 22, y: 8 }, { x: 23, y: 8 }, { x: 24, y: 8 }, { x: 25, y: 8 },
  { x: 11, y: 9 }, { x: 12, y: 9 }, { x: 13, y: 9 }, { x: 14, y: 9 }, { x: 15, y: 9 },
  { x: 16, y: 9 }, { x: 17, y: 9 }, { x: 18, y: 9 }, { x: 19, y: 9 }, { x: 20, y: 9 },
  { x: 21, y: 9 }, { x: 22, y: 9 }, { x: 23, y: 9 }, { x: 24, y: 9 }, { x: 25, y: 9 }, { x: 26, y: 9 },
  { x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 }, { x: 13, y: 10 }, { x: 14, y: 10 },
  { x: 15, y: 10 }, { x: 16, y: 10 }, { x: 17, y: 10 }, { x: 18, y: 10 }, { x: 19, y: 10 },
  { x: 20, y: 10 }, { x: 21, y: 10 }, { x: 22, y: 10 }, { x: 23, y: 10 }, { x: 24, y: 10 },
  { x: 25, y: 10 }, { x: 26, y: 10 }, { x: 27, y: 10 },
  { x: 9, y: 11 }, { x: 10, y: 11 }, { x: 11, y: 11 }, { x: 12, y: 11 }, { x: 13, y: 11 },
  { x: 14, y: 11 }, { x: 15, y: 11 }, { x: 16, y: 11 }, { x: 17, y: 11 }, { x: 18, y: 11 },
  { x: 19, y: 11 }, { x: 20, y: 11 }, { x: 21, y: 11 }, { x: 22, y: 11 }, { x: 23, y: 11 },
  { x: 24, y: 11 }, { x: 25, y: 11 }, { x: 26, y: 11 }, { x: 27, y: 11 },
  { x: 8, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 }, { x: 11, y: 12 }, { x: 12, y: 12 },
  { x: 13, y: 12 }, { x: 14, y: 12 }, { x: 15, y: 12 }, { x: 16, y: 12 }, { x: 17, y: 12 },
  { x: 18, y: 12 }, { x: 19, y: 12 }, { x: 20, y: 12 }, { x: 21, y: 12 }, { x: 22, y: 12 },
  { x: 23, y: 12 }, { x: 24, y: 12 }, { x: 25, y: 12 }, { x: 26, y: 12 }, { x: 27, y: 12 }, { x: 28, y: 12 },
  { x: 8, y: 13 }, { x: 9, y: 13 }, { x: 10, y: 13 }, { x: 11, y: 13 }, { x: 12, y: 13 },
  { x: 13, y: 13 }, { x: 14, y: 13 }, { x: 15, y: 13 }, { x: 16, y: 13 }, { x: 17, y: 13 },
  { x: 18, y: 13 }, { x: 19, y: 13 }, { x: 20, y: 13 }, { x: 21, y: 13 }, { x: 22, y: 13 },
  { x: 23, y: 13 }, { x: 24, y: 13 }, { x: 25, y: 13 }, { x: 26, y: 13 }, { x: 27, y: 13 },
  { x: 28, y: 13 }, { x: 29, y: 13 },
  { x: 7, y: 14 }, { x: 8, y: 14 }, { x: 9, y: 14 }, { x: 10, y: 14 }, { x: 11, y: 14 },
  { x: 12, y: 14 }, { x: 13, y: 14 }, { x: 14, y: 14 }, { x: 15, y: 14 }, { x: 16, y: 14 },
  { x: 17, y: 14 }, { x: 18, y: 14 }, { x: 19, y: 14 }, { x: 20, y: 14 }, { x: 21, y: 14 },
  { x: 22, y: 14 }, { x: 23, y: 14 }, { x: 24, y: 14 }, { x: 25, y: 14 }, { x: 26, y: 14 },
  { x: 27, y: 14 }, { x: 28, y: 14 }, { x: 29, y: 14 }, { x: 30, y: 14 },
  { x: 6, y: 15 }, { x: 7, y: 15 }, { x: 8, y: 15 }, { x: 9, y: 15 }, { x: 10, y: 15 },
  { x: 11, y: 15 }, { x: 12, y: 15 }, { x: 13, y: 15 }, { x: 14, y: 15 }, { x: 15, y: 15 },
  { x: 16, y: 15 }, { x: 17, y: 15 }, { x: 18, y: 15 }, { x: 19, y: 15 }, { x: 20, y: 15 },
  { x: 21, y: 15 }, { x: 22, y: 15 }, { x: 23, y: 15 }, { x: 24, y: 15 }, { x: 25, y: 15 },
  { x: 26, y: 15 }, { x: 27, y: 15 }, { x: 28, y: 15 }, { x: 29, y: 15 }, { x: 30, y: 15 },
  { x: 6, y: 16 }, { x: 7, y: 16 }, { x: 8, y: 16 }, { x: 9, y: 16 }, { x: 10, y: 16 },
  { x: 11, y: 16 }, { x: 12, y: 16 }, { x: 13, y: 16 }, { x: 14, y: 16 }, { x: 15, y: 16 },
  { x: 16, y: 16 }, { x: 17, y: 16 }, { x: 18, y: 16 }, { x: 19, y: 16 }, { x: 20, y: 16 },
  { x: 21, y: 16 }, { x: 22, y: 16 }, { x: 23, y: 16 }, { x: 24, y: 16 }, { x: 25, y: 16 },
  { x: 26, y: 16 }, { x: 27, y: 16 }, { x: 28, y: 16 }, { x: 29, y: 16 }, { x: 30, y: 16 }, { x: 31, y: 16 },
  { x: 6, y: 17 }, { x: 7, y: 17 }, { x: 8, y: 17 }, { x: 9, y: 17 }, { x: 10, y: 17 },
  { x: 11, y: 17 }, { x: 12, y: 17 }, { x: 13, y: 17 }, { x: 14, y: 17 }, { x: 15, y: 17 },
  { x: 16, y: 17 }, { x: 17, y: 17 }, { x: 18, y: 17 }, { x: 19, y: 17 }, { x: 20, y: 17 },
  { x: 21, y: 17 }, { x: 22, y: 17 }, { x: 23, y: 17 }, { x: 24, y: 17 }, { x: 25, y: 17 },
  { x: 26, y: 17 }, { x: 27, y: 17 }, { x: 28, y: 17 }, { x: 29, y: 17 }, { x: 30, y: 17 },
  { x: 31, y: 17 }, { x: 32, y: 17 },
  { x: 7, y: 18 }, { x: 8, y: 18 }, { x: 9, y: 18 }, { x: 10, y: 18 }, { x: 11, y: 18 },
  { x: 12, y: 18 }, { x: 13, y: 18 }, { x: 14, y: 18 }, { x: 15, y: 18 }, { x: 16, y: 18 },
  { x: 17, y: 18 }, { x: 18, y: 18 }, { x: 19, y: 18 }, { x: 20, y: 18 }, { x: 21, y: 18 },
  { x: 22, y: 18 }, { x: 23, y: 18 }, { x: 24, y: 18 }, { x: 25, y: 18 }, { x: 26, y: 18 },
  { x: 27, y: 18 }, { x: 28, y: 18 }, { x: 29, y: 18 }, { x: 30, y: 18 }, { x: 31, y: 18 },
  { x: 32, y: 18 }, { x: 33, y: 18 },
  { x: 9, y: 19 }, { x: 10, y: 19 }, { x: 11, y: 19 }, { x: 12, y: 19 }, { x: 13, y: 19 },
  { x: 14, y: 19 }, { x: 15, y: 19 }, { x: 16, y: 19 }, { x: 17, y: 19 }, { x: 18, y: 19 },
  { x: 19, y: 19 }, { x: 20, y: 19 }, { x: 21, y: 19 }, { x: 22, y: 19 }, { x: 23, y: 19 },
  { x: 24, y: 19 }, { x: 25, y: 19 }, { x: 26, y: 19 }, { x: 27, y: 19 }, { x: 28, y: 19 },
  { x: 29, y: 19 }, { x: 30, y: 19 }, { x: 31, y: 19 }, { x: 32, y: 19 },
  { x: 10, y: 20 }, { x: 11, y: 20 }, { x: 12, y: 20 }, { x: 13, y: 20 }, { x: 14, y: 20 },
  { x: 15, y: 20 }, { x: 16, y: 20 }, { x: 17, y: 20 }, { x: 18, y: 20 }, { x: 19, y: 20 },
  { x: 20, y: 20 }, { x: 21, y: 20 }, { x: 22, y: 20 }, { x: 23, y: 20 }, { x: 24, y: 20 },
  { x: 25, y: 20 }, { x: 26, y: 20 }, { x: 27, y: 20 }, { x: 28, y: 20 }, { x: 29, y: 20 },
  { x: 30, y: 20 }, { x: 31, y: 20 },
  { x: 11, y: 21 }, { x: 12, y: 21 }, { x: 13, y: 21 }, { x: 14, y: 21 }, { x: 15, y: 21 },
  { x: 16, y: 21 }, { x: 17, y: 21 }, { x: 18, y: 21 }, { x: 19, y: 21 }, { x: 20, y: 21 },
  { x: 21, y: 21 }, { x: 22, y: 21 }, { x: 23, y: 21 }, { x: 24, y: 21 }, { x: 25, y: 21 },
  { x: 26, y: 21 }, { x: 27, y: 21 }, { x: 28, y: 21 }, { x: 29, y: 21 }, { x: 30, y: 21 }, { x: 31, y: 21 }
];

// Game constants
export const GAME_CONFIG = {
  // Canvas
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  // Player
  PLAYER_WIDTH: 40,
  PLAYER_HEIGHT: 30,
  PLAYER_SPEED: 5,
  PLAYER_LIVES: 3,

  // Invaders
  INVADER_CELL_SIZE: 16,
  INVADER_SCALE: 0.8,
  INVADER_OFFSET_X: 100,
  INVADER_OFFSET_Y: 40,
  INVADER_MOVE_SPEED: 0.3,
  INVADER_MOVE_DOWN: 20,

  // Bullets
  BULLET_WIDTH: 4,
  BULLET_HEIGHT: 12,
  BULLET_SPEED: 7,
  BASE_FIRE_RATE: 500, // ms between shots

  // Scoring
  POINTS_PER_BEAR: 10,
  CURRENCY_PER_BEAR: 5,

  // Colors (Stanford/Cal themed)
  COLOR_BACKGROUND: '#001f5b',
  COLOR_PLAYER: '#8B5CF6',
  COLOR_BULLET: '#00FF41',
  COLOR_BEAR_HEAD: '#fdb515',
  COLOR_BEAR_OUTLINE: '#000000',
  COLOR_UI: '#FFFFFF'
};

// Upgrade definitions
export const UPGRADES = {
  fireRate: {
    name: 'Fire Rate',
    description: 'Shoot faster',
    icon: '⚡',
    maxLevel: 5,
    baseCost: 50,
    costMultiplier: 1.5,
    effect: (level) => GAME_CONFIG.BASE_FIRE_RATE / (1 + level * 0.3)
  },
  damage: {
    name: 'Bullet Damage',
    description: 'More damage per shot',
    icon: '💥',
    maxLevel: 5,
    baseCost: 75,
    costMultiplier: 1.8,
    effect: (level) => 1 + level
  },
  multiShot: {
    name: 'Multi-Shot',
    description: 'Fire multiple bullets',
    icon: '🔫',
    maxLevel: 3,
    baseCost: 150,
    costMultiplier: 2.5,
    effect: (level) => level + 1 // 1-4 bullets
  },
  shield: {
    name: 'Shield',
    description: 'Extra hit points',
    icon: '🛡️',
    maxLevel: 5,
    baseCost: 100,
    costMultiplier: 2.0,
    effect: (level) => level * 2 // +2 HP per level
  },
  speed: {
    name: 'Speed Boost',
    description: 'Move faster',
    icon: '🚀',
    maxLevel: 3,
    baseCost: 60,
    costMultiplier: 1.6,
    effect: (level) => GAME_CONFIG.PLAYER_SPEED * (1 + level * 0.4)
  }
};

// Calculate upgrade cost
export function getUpgradeCost(upgradeKey, currentLevel) {
  const upgrade = UPGRADES[upgradeKey];
  if (currentLevel >= upgrade.maxLevel) return Infinity;
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
}
