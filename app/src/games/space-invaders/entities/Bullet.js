/**
 * Bullet Entity
 */

import { GAME_CONFIG } from '../config.js';

export class Bullet {
  constructor(x, y, damage = 1) {
    this.x = x;
    this.y = y;
    this.width = GAME_CONFIG.BULLET_WIDTH;
    this.height = GAME_CONFIG.BULLET_HEIGHT;
    this.speed = GAME_CONFIG.BULLET_SPEED;
    this.damage = damage;
    this.active = true;
  }

  update() {
    this.y -= this.speed;

    // Deactivate if off screen
    if (this.y + this.height < 0) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;

    // Glowing bullet effect
    ctx.save();

    // Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = GAME_CONFIG.COLOR_BULLET;

    // Bullet core
    ctx.fillStyle = GAME_CONFIG.COLOR_BULLET;
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);

    // Bright tip
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height / 3);

    ctx.restore();
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
