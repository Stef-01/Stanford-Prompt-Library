/**
 * Bear Invader Entity
 * Smiley bear enemy with Cal colors
 */

import { GAME_CONFIG } from '../config.js';

export class BearInvader {
  constructor(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.x = GAME_CONFIG.INVADER_OFFSET_X + gridX * GAME_CONFIG.INVADER_CELL_SIZE;
    this.y = GAME_CONFIG.INVADER_OFFSET_Y + gridY * GAME_CONFIG.INVADER_CELL_SIZE;
    this.alive = true;
    this.scale = GAME_CONFIG.INVADER_SCALE;
    this.radius = 6 * this.scale; // Collision radius
  }

  update(offsetX, offsetY) {
    this.x = GAME_CONFIG.INVADER_OFFSET_X + this.gridX * GAME_CONFIG.INVADER_CELL_SIZE + offsetX;
    this.y = GAME_CONFIG.INVADER_OFFSET_Y + this.gridY * GAME_CONFIG.INVADER_CELL_SIZE + offsetY;
  }

  draw(ctx) {
    if (!this.alive) return;

    const r = 6 * this.scale;
    const earR = 3 * this.scale;

    const headColor = GAME_CONFIG.COLOR_BEAR_HEAD;
    const outline = GAME_CONFIG.COLOR_BEAR_OUTLINE;
    const eyeColor = GAME_CONFIG.COLOR_BEAR_OUTLINE;

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

  hit() {
    this.alive = false;
  }
}
