/**
 * Enemy Bullet Entity
 * Bullets shot by bears, moving downward
 */

import { GAME_CONFIG } from '../config.js';

export class EnemyBullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = GAME_CONFIG.BULLET_WIDTH;
    this.height = GAME_CONFIG.BULLET_HEIGHT;
    this.speed = GAME_CONFIG.BULLET_SPEED * 0.7; // Slightly slower than player bullets
    this.active = true;
  }

  update() {
    this.y += this.speed; // Move DOWN instead of up

    // Deactivate if off screen
    if (this.y > GAME_CONFIG.CANVAS_HEIGHT) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active) return;

    // Enemy bullet effect (red/orange)
    ctx.save();

    // Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff4444';

    // Bullet core
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);

    // Bright tip (at bottom since moving down)
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(this.x - this.width / 2, this.y + this.height * 2/3, this.width, this.height / 3);

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
