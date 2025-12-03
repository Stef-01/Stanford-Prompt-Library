/**
 * Space Invaders Game Engine
 * Core game loop and state management
 */

import { GAME_CONFIG, BEAR_WAVE } from './config.js';
import { Player } from './entities/Player.js';
import { BearInvader } from './entities/BearInvader.js';
import { Bullet } from './entities/Bullet.js';
import { EnemyBullet } from './entities/EnemyBullet.js';
import { Weapon, WEAPON_TYPES, ExplosiveBullet, PiercingBullet, BouncyBullet } from './entities/Weapon.js';
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

    // Weapons
    this.currentWeapon = new Weapon(WEAPON_TYPES.STANDARD);
    this.availableWeapons = Object.values(WEAPON_TYPES);

    // Entities
    this.player = null;
    this.invaders = [];
    this.bullets = [];
    this.enemyBullets = [];

    // Invader movement
    this.invaderOffsetX = 0;
    this.invaderOffsetY = 0;
    this.invaderDirection = 1;
    this.invaderMoveTimer = 0;

    // Shooting
    this.lastShotTime = 0;
    this.lastEnemyShotTime = 0;

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

    // Weapon switching (1-6 keys)
    if (this.state === 'playing' && e.key >= '1' && e.key <= '6') {
      const weaponIndex = parseInt(e.key) - 1;
      if (weaponIndex < this.availableWeapons.length) {
        this.currentWeapon = new Weapon(this.availableWeapons[weaponIndex]);
        console.log(`[SpaceInvaders] Switched to weapon: ${this.currentWeapon.name}`);
        this.notifyStateChange();
      }
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
    this.enemyBullets = [];
    this.invaderOffsetX = 0;
    this.invaderOffsetY = 0;
    this.invaderDirection = 1;

    // Progressive difficulty: Exponential growth for balanced scaling
    // Wave 1: 10, Wave 5: 16, Wave 10: 31, Wave 20: 96
    const bearsThisWave = Math.floor(10 * (1.12 ** (this.wave - 1)));

    // Take only the first N bears from the pattern based on wave number
    const bearsToSpawn = BEAR_WAVE.slice(0, Math.min(bearsThisWave, BEAR_WAVE.length));

    bearsToSpawn.forEach(({ x, y }) => {
      this.invaders.push(new BearInvader(x, y, this.wave));
    });

    console.log(`[SpaceInvaders] Created ${this.invaders.length} bears for wave ${this.wave}`);
  }

  shoot() {
    const now = Date.now();
    // Apply weapon fire rate modifier
    const baseFireRate = this.upgradeSystem.getFireRate();
    const fireRate = baseFireRate / this.currentWeapon.fireRate;

    if (now - this.lastShotTime < fireRate) return;

    this.lastShotTime = now;
    const damage = this.upgradeSystem.getDamage();
    const multiShot = this.upgradeSystem.getMultiShotCount();

    // Use weapon system to create bullets
    const newBullets = this.currentWeapon.createBullets(this.player, damage, multiShot);
    this.bullets.push(...newBullets);
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
      // Apply specific upgrades based on what was purchased
      if (upgradeKey === 'speed') {
        this.player.speed = this.upgradeSystem.getSpeed();
      }
      if (upgradeKey === 'shield') {
        this.player.maxLives = this.upgradeSystem.getMaxShield();
      }
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

    // Update enemy bullets
    this.enemyBullets.forEach(bullet => bullet.update());
    this.enemyBullets = this.enemyBullets.filter(bullet => bullet.active);

    // Update invaders movement
    this.updateInvaders();

    // Enemy shooting (gets more frequent in later waves)
    this.updateEnemyShooting(currentTime);

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

  updateEnemyShooting(currentTime) {
    // Bears shoot back from wave 1, getting more aggressive over time

    // Shooting frequency increases with wave number
    // Wave 1 shoots every 3 seconds, gets faster each wave
    const shootInterval = Math.max(600, 3000 - (this.wave * 200));

    if (currentTime - this.lastEnemyShotTime < shootInterval) return;

    // Get all alive invaders
    const aliveInvaders = this.invaders.filter(inv => inv.alive);
    if (aliveInvaders.length === 0) return;

    // Number of bears that shoot at once increases with wave
    const shootersCount = Math.min(Math.floor(this.wave / 3) + 1, 5);

    for (let i = 0; i < shootersCount; i++) {
      // Pick a random bear to shoot
      const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
      this.enemyBullets.push(new EnemyBullet(shooter.x, shooter.y + 10));
    }

    this.lastEnemyShotTime = currentTime;
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
    // Bullet vs Invader - handle special bullet types
    const hits = CollisionSystem.checkBulletInvaderCollisions(this.bullets, this.invaders);
    const damage = this.upgradeSystem.getDamage();

    hits.forEach(({ bullet, invader }) => {
      // Check for explosive bullets
      if (bullet instanceof ExplosiveBullet && !bullet.hasExploded) {
        // Damage all invaders in radius
        const explosionX = bullet.x;
        const explosionY = bullet.y;
        const radius = bullet.explosionRadius;

        this.invaders.forEach(inv => {
          if (!inv.alive) return;

          const dx = inv.x - explosionX;
          const dy = inv.y - explosionY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= radius) {
            const died = inv.hit(damage);
            if (died) {
              this.score += GAME_CONFIG.POINTS_PER_BEAR;
              this.upgradeSystem.addCurrency(GAME_CONFIG.CURRENCY_PER_BEAR);
            }
          }
        });

        bullet.explode();
        this.notifyScoreUpdate();
      }
      // Check for piercing bullets
      else if (bullet instanceof PiercingBullet) {
        const died = invader.hit(damage);
        if (died) {
          this.score += GAME_CONFIG.POINTS_PER_BEAR;
          this.upgradeSystem.addCurrency(GAME_CONFIG.CURRENCY_PER_BEAR);
        }
        // Piercing bullets continue after hitting
        bullet.hit(); // Returns true if bullet should continue
        this.notifyScoreUpdate();
      }
      // Normal bullets (including bouncy)
      else {
        const died = invader.hit(damage);
        if (died) {
          this.score += GAME_CONFIG.POINTS_PER_BEAR;
          this.upgradeSystem.addCurrency(GAME_CONFIG.CURRENCY_PER_BEAR);
        }
        this.notifyScoreUpdate();
      }
    });

    // Player vs Invader
    const hitInvader = CollisionSystem.checkPlayerInvaderCollisions(this.player, this.invaders);
    if (hitInvader) {
      hitInvader.hit(999); // Instant kill on collision with player
      if (this.player.takeDamage()) {
        if (this.player.lives <= 0) {
          this.gameOver();
        }
      }
    }

    // Enemy Bullets vs Player
    this.enemyBullets.forEach(bullet => {
      if (!bullet.active) return;

      const playerBounds = this.player.getBounds();
      const bulletBounds = bullet.getBounds();

      // Simple AABB collision
      if (bulletBounds.x < playerBounds.x + playerBounds.width &&
          bulletBounds.x + bulletBounds.width > playerBounds.x &&
          bulletBounds.y < playerBounds.y + playerBounds.height &&
          bulletBounds.y + bulletBounds.height > playerBounds.y) {
        bullet.active = false;
        if (this.player.takeDamage()) {
          if (this.player.lives <= 0) {
            this.gameOver();
          }
        }
        this.notifyStateChange();
      }
    });
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = GAME_CONFIG.COLOR_BACKGROUND;
    this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Draw invaders
    this.invaders.forEach(invader => invader.draw(this.ctx));

    // Draw bullets
    this.bullets.forEach(bullet => bullet.draw(this.ctx));

    // Draw enemy bullets
    this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));

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
        upgrades: this.upgradeSystem.getAllUpgrades(),
        weapon: {
          name: this.currentWeapon.name,
          type: this.currentWeapon.type,
          color: this.currentWeapon.color
        }
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
