/**
 * Bear Invader Entity
 * Smiley bear enemy with Cal colors
 */

import { GAME_CONFIG } from '../config.js';

export class BearInvader {
  constructor(gridX, gridY, wave = 1) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.x = GAME_CONFIG.INVADER_OFFSET_X + gridX * GAME_CONFIG.INVADER_CELL_SIZE;
    this.y = GAME_CONFIG.INVADER_OFFSET_Y + gridY * GAME_CONFIG.INVADER_CELL_SIZE;
    this.alive = true;
    this.scale = GAME_CONFIG.INVADER_SCALE;
    this.radius = 6 * this.scale; // Collision radius

    // Health system - scales with wave number
    this.maxHealth = 1 + Math.floor(wave / 3); // Wave 1-2: 1hp, 3-5: 2hp, 6-8: 3hp, etc
    this.currentHealth = this.maxHealth;

    // Visual feedback
    this.hitFlash = 0;
  }

  update(offsetX, offsetY) {
    this.x = GAME_CONFIG.INVADER_OFFSET_X + this.gridX * GAME_CONFIG.INVADER_CELL_SIZE + offsetX;
    this.y = GAME_CONFIG.INVADER_OFFSET_Y + this.gridY * GAME_CONFIG.INVADER_CELL_SIZE + offsetY;

    // Decay hit flash
    if (this.hitFlash > 0) {
      this.hitFlash -= 0.05;
    }
  }

  draw(ctx) {
    if (!this.alive) return;

    const r = 6 * this.scale;
    const earR = 3 * this.scale;

    let headColor = GAME_CONFIG.COLOR_BEAR_HEAD;
    const outline = GAME_CONFIG.COLOR_BEAR_OUTLINE;
    const eyeColor = GAME_CONFIG.COLOR_BEAR_OUTLINE;

    // Flash white when hit
    if (this.hitFlash > 0) {
      const flashIntensity = this.hitFlash;
      headColor = `rgba(255, 255, 255, ${flashIntensity})`;
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    // Ears
    ctx.fillStyle = headColor;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.2 * this.scale;

    ctx.beginPath();
    ctx.arc(-4 * this.scale, -6 * this.scale, earR, 0, Math.PI * 2);
    ctx.arc(4 * this.scale, -6 * this.scale, earR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(-2 * this.scale, -2 * this.scale, 0.8 * this.scale, 0, Math.PI * 2);
    ctx.arc(2 * this.scale, -2 * this.scale, 0.8 * this.scale, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.arc(0, 0.5 * this.scale, 1.2 * this.scale, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = eyeColor;
    ctx.lineWidth = 0.8 * this.scale;
    ctx.beginPath();
    ctx.arc(0, 2 * this.scale, 3 * this.scale, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.restore();

    // Health bar (only show if maxHealth > 1 or damaged)
    if (this.maxHealth > 1 || this.currentHealth < this.maxHealth) {
      const barWidth = 16 * this.scale;
      const barHeight = 3;
      const barX = this.x - barWidth / 2;
      const barY = this.y - 12 * this.scale;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Health
      const healthPercent = this.currentHealth / this.maxHealth;
      const healthColor = healthPercent > 0.6 ? '#00FF41' : healthPercent > 0.3 ? '#FFD700' : '#FF4444';
      ctx.fillStyle = healthColor;
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
  }

  getBounds() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
      centerX: this.x,
      centerY: this.y,
      radius: this.radius
    };
  }

  hit(damage = 1) {
    this.currentHealth -= damage;
    this.hitFlash = 1.0; // Full flash on hit

    if (this.currentHealth <= 0) {
      this.alive = false;
      return true; // Bear died
    }
    return false; // Bear still alive
  }
}
