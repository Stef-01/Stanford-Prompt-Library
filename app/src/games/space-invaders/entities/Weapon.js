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
  constructor(type = WEAPON_TYPES.STANDARD, weaponPowerLevel = 0) {
    this.type = type;
    this.weaponPowerLevel = weaponPowerLevel;
    this.isEvolved = weaponPowerLevel >= 5;
    this.name = this.getWeaponName();
    this.color = this.getWeaponColor();
    this.fireRate = this.getBaseFireRate();
  }

  getWeaponName() {
    if (this.isEvolved) {
      const evolvedNames = {
        [WEAPON_TYPES.STANDARD]: 'Mega Cannon',
        [WEAPON_TYPES.SPREAD]: 'Nova Burst',
        [WEAPON_TYPES.LASER]: 'X-Ray Disintegrator',
        [WEAPON_TYPES.EXPLOSIVE]: 'Nuke Launcher',
        [WEAPON_TYPES.PIERCING]: 'Rail Gun',
        [WEAPON_TYPES.BOUNCY]: 'Chaos Orb'
      };
      return evolvedNames[this.type] || 'Unknown';
    }

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
        // Continuous laser beam - evolved form is thicker and more powerful
        bullets.push(new LaserBullet(centerX, bulletY, damage, this.color, this.isEvolved));
        break;

      case WEAPON_TYPES.EXPLOSIVE:
        // Single explosive bullet - evolved form has much bigger radius
        bullets.push(new ExplosiveBullet(centerX, bulletY, damage * 2, this.color, this.isEvolved));
        break;

      case WEAPON_TYPES.PIERCING:
        // Piercing bullets that go through enemies - evolved form pierces more
        const piercingCount = Math.min(Math.ceil(multiShotCount / 2), 5);
        const piercingSpread = piercingCount * 12;
        const piercingStartX = centerX - piercingSpread / 2;
        for (let i = 0; i < piercingCount; i++) {
          const x = piercingStartX + (piercingSpread / (piercingCount - 1 || 1)) * i;
          bullets.push(new PiercingBullet(x, bulletY, damage, this.color, this.isEvolved));
        }
        break;

      case WEAPON_TYPES.BOUNCY:
        // Bouncy pong-ball style bullets - evolved form bounces more and is faster
        const bouncyCount = Math.min(Math.ceil(multiShotCount / 3), 3);
        for (let i = 0; i < bouncyCount; i++) {
          const offsetX = (i - (bouncyCount - 1) / 2) * 20;
          bullets.push(new BouncyBullet(centerX + offsetX, bulletY, damage, this.color, this.isEvolved));
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
  constructor(x, y, damage, color, isEvolved = false) {
    super(x, y, damage, color);
    // Evolved form: X-Ray Disintegrator - much thicker, taller, faster
    this.isEvolved = isEvolved;
    this.height = isEvolved ? 60 : 40;
    this.width = isEvolved ? 12 : GAME_CONFIG.BULLET_WIDTH;
    this.speed = GAME_CONFIG.BULLET_SPEED * (isEvolved ? 3 : 2);
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
    ctx.shadowBlur = this.isEvolved ? 20 : 10;
    ctx.shadowColor = this.color;
    ctx.fillRect(
      this.x - this.width / 2,
      this.y,
      this.width,
      this.height
    );
    ctx.shadowBlur = 0;
  }

  getBounds() {
    return {
      x: this.x - this.width / 2,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

// Explosive bullet (damages multiple enemies)
class ExplosiveBullet extends Bullet {
  constructor(x, y, damage, color, isEvolved = false) {
    super(x, y, damage, color);
    // Evolved form: Nuke Launcher - much bigger explosion radius
    this.isEvolved = isEvolved;
    this.explosionRadius = isEvolved ? 120 : 50;
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
  constructor(x, y, damage, color, isEvolved = false) {
    // Evolved form: Rail Gun - more pierces, higher damage
    super(x, y, damage * (isEvolved ? 1.0 : 0.7), color);
    this.isEvolved = isEvolved;
    this.pierceCount = 0;
    this.maxPierces = isEvolved ? 15 : 5;
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
  constructor(x, y, damage, color, isEvolved = false) {
    super(x, y, damage, color);
    // Evolved form: Chaos Orb - faster, more bounces, bigger
    this.isEvolved = isEvolved;
    this.speedX = (Math.random() - 0.5) * (isEvolved ? 5 : 3);
    this.speedY = -GAME_CONFIG.BULLET_SPEED * (isEvolved ? 1.5 : 1);
    this.bounces = 0;
    this.maxBounces = isEvolved ? 12 : 4;
    this.radius = isEvolved ? 9 : 6;
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
