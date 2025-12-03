/**
 * Weapon System
 * Different weapon types with unique behaviors
 */

import { GAME_CONFIG } from '../config.js';
import { Bullet } from './Bullet.js';

export const WEAPON_TYPES = {
  STANDARD: 'standard',
  SPREAD: 'spread',
  LASER: 'laser',
  EXPLOSIVE: 'explosive',
  PIERCING: 'piercing',
  BOUNCY: 'bouncy'
};

export class Weapon {
  constructor(type = WEAPON_TYPES.STANDARD) {
    this.type = type;
    this.name = this.getWeaponName();
    this.color = this.getWeaponColor();
    this.fireRate = this.getBaseFireRate();
  }

  getWeaponName() {
    const names = {
      [WEAPON_TYPES.STANDARD]: 'Standard',
      [WEAPON_TYPES.SPREAD]: 'Spread Shot',
      [WEAPON_TYPES.LASER]: 'Laser Beam',
      [WEAPON_TYPES.EXPLOSIVE]: 'Explosive',
      [WEAPON_TYPES.PIERCING]: 'Piercing',
      [WEAPON_TYPES.BOUNCY]: 'Bouncy Ball'
    };
    return names[this.type] || 'Unknown';
  }

  getWeaponColor() {
    const colors = {
      [WEAPON_TYPES.STANDARD]: '#00FF41',
      [WEAPON_TYPES.SPREAD]: '#FFD700',
      [WEAPON_TYPES.LASER]: '#FF00FF',
      [WEAPON_TYPES.EXPLOSIVE]: '#FF6B00',
      [WEAPON_TYPES.PIERCING]: '#00FFFF',
      [WEAPON_TYPES.BOUNCY]: '#FFFFFF'
    };
    return colors[this.type] || '#00FF41';
  }

  getBaseFireRate() {
    const rates = {
      [WEAPON_TYPES.STANDARD]: 1.0,
      [WEAPON_TYPES.SPREAD]: 1.2,
      [WEAPON_TYPES.LASER]: 2.0,
      [WEAPON_TYPES.EXPLOSIVE]: 0.7,
      [WEAPON_TYPES.PIERCING]: 1.1,
      [WEAPON_TYPES.BOUNCY]: 0.9
    };
    return rates[this.type] || 1.0;
  }

  createBullets(player, damage, multiShotCount) {
    const bullets = [];
    const centerX = player.x + player.width / 2;
    const bulletY = player.y;

    switch (this.type) {
      case WEAPON_TYPES.STANDARD:
        // Standard multi-shot
        if (multiShotCount === 1) {
          bullets.push(new Bullet(centerX, bulletY, damage, this.color));
        } else {
          const spread = Math.min(multiShotCount * 8, 160);
          const startX = centerX - spread / 2;
          for (let i = 0; i < multiShotCount; i++) {
            const x = startX + (spread / (multiShotCount - 1)) * i;
            bullets.push(new Bullet(x, bulletY, damage, this.color));
          }
        }
        break;

      case WEAPON_TYPES.SPREAD:
        // Spread shot with angles
        const angleCount = Math.min(multiShotCount + 2, 9);
        const maxAngle = 30; // degrees
        const angleStep = (maxAngle * 2) / (angleCount - 1);
        for (let i = 0; i < angleCount; i++) {
          const angle = (maxAngle - angleStep * i) * Math.PI / 180;
          const bullet = new SpreadBullet(centerX, bulletY, damage, this.color, angle);
          bullets.push(bullet);
        }
        break;

      case WEAPON_TYPES.LASER:
        // Continuous laser beam
        bullets.push(new LaserBullet(centerX, bulletY, damage, this.color));
        break;

      case WEAPON_TYPES.EXPLOSIVE:
        // Single explosive bullet
        bullets.push(new ExplosiveBullet(centerX, bulletY, damage * 2, this.color));
        break;

      case WEAPON_TYPES.PIERCING:
        // Piercing bullets that go through enemies
        const piercingCount = Math.min(Math.ceil(multiShotCount / 2), 5);
        const piercingSpread = piercingCount * 12;
        const piercingStartX = centerX - piercingSpread / 2;
        for (let i = 0; i < piercingCount; i++) {
          const x = piercingStartX + (piercingSpread / (piercingCount - 1 || 1)) * i;
          bullets.push(new PiercingBullet(x, bulletY, damage, this.color));
        }
        break;

      case WEAPON_TYPES.BOUNCY:
        // Bouncy pong-ball style bullets
        const bouncyCount = Math.min(Math.ceil(multiShotCount / 3), 3);
        for (let i = 0; i < bouncyCount; i++) {
          const offsetX = (i - (bouncyCount - 1) / 2) * 20;
          bullets.push(new BouncyBullet(centerX + offsetX, bulletY, damage, this.color));
        }
        break;
    }

    return bullets;
  }
}

// Spread bullet with angled movement
class SpreadBullet extends Bullet {
  constructor(x, y, damage, color, angle) {
    super(x, y, damage, color);
    this.angle = angle;
    this.speedX = Math.sin(angle) * GAME_CONFIG.BULLET_SPEED * 0.7;
    this.speedY = -Math.cos(angle) * GAME_CONFIG.BULLET_SPEED;
  }

  update() {
    if (!this.active) return;

    this.x += this.speedX;
    this.y += this.speedY;

    if (this.y < -GAME_CONFIG.BULLET_HEIGHT ||
        this.x < 0 ||
        this.x > GAME_CONFIG.CANVAS_WIDTH) {
      this.active = false;
    }
  }
}

// Laser beam (tall, fast)
class LaserBullet extends Bullet {
  constructor(x, y, damage, color) {
    super(x, y, damage, color);
    this.height = 40; // Taller laser beam
    this.speed = GAME_CONFIG.BULLET_SPEED * 2;
  }

  update() {
    if (!this.active) return;
    this.y -= this.speed;
    if (this.y < -this.height) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillRect(
      this.x - GAME_CONFIG.BULLET_WIDTH / 2,
      this.y,
      GAME_CONFIG.BULLET_WIDTH,
      this.height
    );
    ctx.shadowBlur = 0;
  }

  getBounds() {
    return {
      x: this.x - GAME_CONFIG.BULLET_WIDTH / 2,
      y: this.y,
      width: GAME_CONFIG.BULLET_WIDTH,
      height: this.height
    };
  }
}

// Explosive bullet (damages multiple enemies)
class ExplosiveBullet extends Bullet {
  constructor(x, y, damage, color) {
    super(x, y, damage, color);
    this.explosionRadius = 50;
    this.hasExploded = false;
  }

  explode() {
    this.hasExploded = true;
    this.active = false;
  }

  draw(ctx) {
    if (!this.active) return;

    // Draw pulsing explosive bullet
    const pulse = Math.sin(Date.now() / 100) * 2 + 6;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = pulse;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y + GAME_CONFIG.BULLET_HEIGHT / 2, pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Piercing bullet (goes through enemies)
class PiercingBullet extends Bullet {
  constructor(x, y, damage, color) {
    super(x, y, damage * 0.7, color); // Lower damage per hit
    this.pierceCount = 0;
    this.maxPierces = 5;
  }

  hit() {
    this.pierceCount++;
    if (this.pierceCount >= this.maxPierces) {
      this.active = false;
    }
    // Bullet continues even after hitting
    return true;
  }

  draw(ctx) {
    if (!this.active) return;

    // Draw glowing piercing bullet with trail
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;

    // Trail effect
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.3 - i * 0.1;
      ctx.fillRect(
        this.x - GAME_CONFIG.BULLET_WIDTH / 2,
        this.y + i * 4,
        GAME_CONFIG.BULLET_WIDTH,
        GAME_CONFIG.BULLET_HEIGHT
      );
    }

    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  }
}

// Bouncy pong-ball style bullet
class BouncyBullet extends Bullet {
  constructor(x, y, damage, color) {
    super(x, y, damage, color);
    this.speedX = (Math.random() - 0.5) * 3;
    this.speedY = -GAME_CONFIG.BULLET_SPEED;
    this.bounces = 0;
    this.maxBounces = 4;
    this.radius = 6;
  }

  update() {
    if (!this.active) return;

    this.x += this.speedX;
    this.y += this.speedY;

    // Bounce off walls
    if (this.x <= this.radius || this.x >= GAME_CONFIG.CANVAS_WIDTH - this.radius) {
      this.speedX *= -1;
      this.x = Math.max(this.radius, Math.min(GAME_CONFIG.CANVAS_WIDTH - this.radius, this.x));
      this.bounces++;
    }

    // Deactivate after max bounces or leaving screen
    if (this.y < -this.radius * 2 || this.bounces >= this.maxBounces) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;

    // Draw pong-ball style circle
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  getBounds() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2
    };
  }
}

// Export special bullet classes for collision detection
export { ExplosiveBullet, PiercingBullet, BouncyBullet };
