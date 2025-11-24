/**
 * Space Invaders Game Engine
 * Core game loop and state management
 */

import { GAME_CONFIG, BEAR_WAVE } from './config.js';
import { Player } from './entities/Player.js';
import { BearInvader } from './entities/BearInvader.js';
import { Bullet } from './entities/Bullet.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { UpgradeSystem } from './systems/UpgradeSystem.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // High-DPI rendering (following matrix-rain pattern)
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = GAME_CONFIG.CANVAS_WIDTH * dpr;
    this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT * dpr;
    this.canvas.style.width = GAME_CONFIG.CANVAS_WIDTH + 'px';
    this.canvas.style.height = GAME_CONFIG.CANVAS_HEIGHT + 'px';
    this.ctx.scale(dpr, dpr);

    // Game state
    this.state = 'menu'; // menu, playing, paused, gameOver, shop
    this.score = 0;
    this.wave = 1;
    this.keys = {};

    // Systems
    this.upgradeSystem = new UpgradeSystem();

    // Entities
    this.player = null;
    this.invaders = [];
    this.bullets = [];

    // Invader movement
    this.invaderOffsetX = 0;
    this.invaderOffsetY = 0;
    this.invaderDirection = 1;
    this.invaderMoveTimer = 0;

    // Shooting
    this.lastShotTime = 0;

    // Animation
    this.animationFrame = null;
    this.lastTime = 0;

    // UI callbacks
    this.onStateChange = null;
    this.onScoreUpdate = null;

    // Input handlers
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);

    console.log('[SpaceInvaders] Game engine initialized');
  }

  init() {
    // Setup input
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    this.showMenu();
  }

  handleKeyDown(e) {
    this.keys[e.key] = true;

    if (e.key === ' ' && this.state === 'playing') {
      e.preventDefault();
      // Don't shoot here - handled in update loop for continuous shooting
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (this.state === 'playing') {
        this.pause();
      } else if (this.state === 'paused' || this.state === 'shop') {
        this.resume();
      }
    }

    if (e.key === 'u' && this.state === 'playing') {
      e.preventDefault();
      this.openShop();
    }
  }

  handleKeyUp(e) {
    this.keys[e.key] = false;
  }

  showMenu() {
    this.state = 'menu';
    this.notifyStateChange();
  }

  startGame() {
    console.log('[SpaceInvaders] Starting game');

    this.state = 'playing';
    this.score = 0;
    this.wave = 1;

    // Apply upgrades to player
    const maxLives = this.upgradeSystem.getMaxShield();

    // Create player
    this.player = new Player(
      GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PLAYER_WIDTH / 2,
      GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PLAYER_HEIGHT - 20
    );
    this.player.maxLives = maxLives;
    this.player.lives = maxLives;
    this.player.speed = this.upgradeSystem.getSpeed();

    // Create first wave
    this.createWave();

    this.notifyStateChange();
    this.startGameLoop();
  }

  createWave() {
    console.log(`[SpaceInvaders] Creating wave ${this.wave}`);

    this.invaders = [];
    this.bullets = [];
    this.invaderOffsetX = 0;
    this.invaderOffsetY = 0;
    this.invaderDirection = 1;

    // Scale down position for different wave sizes
    const scale = 1;
    BEAR_WAVE.forEach(({ x, y }) => {
      this.invaders.push(new BearInvader(x * scale, y * scale));
    });

    console.log(`[SpaceInvaders] Created ${this.invaders.length} bears`);
  }

  shoot() {
    const now = Date.now();
    const fireRate = this.upgradeSystem.getFireRate();

    if (now - this.lastShotTime < fireRate) return;

    this.lastShotTime = now;
    const damage = this.upgradeSystem.getDamage();
    const multiShot = this.upgradeSystem.getMultiShotCount();

    // Create bullets based on multi-shot level
    const playerCenterX = this.player.x + this.player.width / 2;
    const bulletY = this.player.y;

    if (multiShot === 1) {
      // Single bullet
      this.bullets.push(new Bullet(playerCenterX, bulletY, damage));
    } else {
      // Multiple bullets in a spread
      const spread = 15;
      for (let i = 0; i < multiShot; i++) {
        const offset = (i - (multiShot - 1) / 2) * spread;
        this.bullets.push(new Bullet(playerCenterX + offset, bulletY, damage));
      }
    }
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.notifyStateChange();
  }

  resume() {
    if (this.state !== 'paused' && this.state !== 'shop') return;
    this.state = 'playing';
    this.notifyStateChange();
  }

  openShop() {
    if (this.state !== 'playing') return;
    this.state = 'shop';
    this.notifyStateChange();
  }

  purchaseUpgrade(upgradeKey) {
    const success = this.upgradeSystem.purchaseUpgrade(upgradeKey);
    if (success) {
      // Apply upgrades immediately
      this.player.speed = this.upgradeSystem.getSpeed();
      this.player.maxLives = this.upgradeSystem.getMaxShield();
      this.notifyStateChange();
    }
    return success;
  }

  gameOver() {
    console.log('[SpaceInvaders] Game Over! Score:', this.score);
    this.state = 'gameOver';
    this.upgradeSystem.reset();
    this.notifyStateChange();
  }

  startGameLoop() {
    const gameLoop = (currentTime) => {
      if (this.state === 'playing') {
        this.update(currentTime);
        this.render();
      }

      this.animationFrame = requestAnimationFrame(gameLoop);
    };

    this.animationFrame = requestAnimationFrame(gameLoop);
  }

  update(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update player
    this.player.update(this.keys, GAME_CONFIG.CANVAS_WIDTH);

    // Continuous shooting when holding space
    if (this.keys[' ']) {
      this.shoot();
    }

    // Update bullets
    this.bullets.forEach(bullet => bullet.update());
    this.bullets = this.bullets.filter(bullet => bullet.active);

    // Update invaders movement
    this.updateInvaders();

    // Check collisions
    this.checkCollisions();

    // Check wave completion
    const aliveCount = this.invaders.filter(inv => inv.alive).length;
    if (aliveCount === 0) {
      this.wave++;
      this.createWave();
    }

    // Check if invaders reached bottom
    const lowestInvader = this.invaders
      .filter(inv => inv.alive)
      .reduce((max, inv) => Math.max(max, inv.y), 0);

    if (lowestInvader > GAME_CONFIG.CANVAS_HEIGHT - 80) {
      this.gameOver();
    }
  }

  updateInvaders() {
    this.invaderMoveTimer++;

    // Move invaders every X frames (slows down movement)
    // Start at 60 frames (1 second at 60fps), decrease slowly per wave
    const moveInterval = Math.max(20, 60 - (this.wave * 3));
    if (this.invaderMoveTimer >= moveInterval) {
      this.invaderMoveTimer = 0;

      // Move horizontally (slower multiplier)
      this.invaderOffsetX += this.invaderDirection * GAME_CONFIG.INVADER_MOVE_SPEED * 5;

      // Check if need to move down
      const rightMost = Math.max(...this.invaders.filter(inv => inv.alive).map(inv => inv.x));
      const leftMost = Math.min(...this.invaders.filter(inv => inv.alive).map(inv => inv.x));

      if (rightMost > GAME_CONFIG.CANVAS_WIDTH - 50 || leftMost < 30) {
        this.invaderDirection *= -1;
        this.invaderOffsetY += GAME_CONFIG.INVADER_MOVE_DOWN;
      }
    }

    // Update all invader positions
    this.invaders.forEach(inv => inv.update(this.invaderOffsetX, this.invaderOffsetY));
  }

  checkCollisions() {
    // Bullet vs Invader
    const hits = CollisionSystem.checkBulletInvaderCollisions(this.bullets, this.invaders);
    hits.forEach(({ invader }) => {
      invader.hit();
      this.score += GAME_CONFIG.POINTS_PER_BEAR;
      this.upgradeSystem.addCurrency(GAME_CONFIG.CURRENCY_PER_BEAR);
      this.notifyScoreUpdate();
    });

    // Player vs Invader
    const hitInvader = CollisionSystem.checkPlayerInvaderCollisions(this.player, this.invaders);
    if (hitInvader) {
      hitInvader.hit();
      if (this.player.takeDamage()) {
        if (this.player.lives <= 0) {
          this.gameOver();
        }
      }
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = GAME_CONFIG.COLOR_BACKGROUND;
    this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Draw invaders
    this.invaders.forEach(invader => invader.draw(this.ctx));

    // Draw bullets
    this.bullets.forEach(bullet => bullet.draw(this.ctx));

    // Draw player
    this.player.draw(this.ctx);
  }

  notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange({
        state: this.state,
        score: this.score,
        wave: this.wave,
        lives: this.player ? this.player.lives : 0,
        maxLives: this.player ? this.player.maxLives : 3,
        currency: this.upgradeSystem.currency,
        upgrades: this.upgradeSystem.getAllUpgrades()
      });
    }
  }

  notifyScoreUpdate() {
    if (this.onScoreUpdate) {
      this.onScoreUpdate({
        score: this.score,
        currency: this.upgradeSystem.currency
      });
    }
  }

  cleanup() {
    console.log('[SpaceInvaders] Cleaning up');

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }
}
