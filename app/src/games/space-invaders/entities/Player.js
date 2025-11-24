/**
 * Player Ship Entity
 */

import { GAME_CONFIG } from '../config.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = GAME_CONFIG.PLAYER_WIDTH;
    this.height = GAME_CONFIG.PLAYER_HEIGHT;
    this.speed = GAME_CONFIG.PLAYER_SPEED;
    this.lives = GAME_CONFIG.PLAYER_LIVES;
    this.maxLives = GAME_CONFIG.PLAYER_LIVES;
    this.invulnerable = false;
    this.invulnerableTime = 0;
  }

  update(keys, canvasWidth) {
    // Movement
    if (keys['ArrowLeft'] || keys['a']) {
      this.x -= this.speed;
    }
    if (keys['ArrowRight'] || keys['d']) {
      this.x += this.speed;
    }

    // Keep within bounds
    this.x = Math.max(0, Math.min(this.x, canvasWidth - this.width));

    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerableTime--;
      if (this.invulnerableTime <= 0) {
        this.invulnerable = false;
      }
    }
  }

  draw(ctx) {
    ctx.save();

    // Flashing effect when invulnerable
    if (this.invulnerable && Math.floor(this.invulnerableTime / 5) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Draw spaceship (triangle)
    ctx.fillStyle = GAME_CONFIG.COLOR_PLAYER;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    ctx.beginPath();
    // Nose
    ctx.moveTo(this.x + this.width / 2, this.y);
    // Bottom right
    ctx.lineTo(this.x + this.width, this.y + this.height);
    // Bottom left
    ctx.lineTo(this.x, this.y + this.height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit glow
    ctx.fillStyle = '#00FF41';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  takeDamage() {
    if (this.invulnerable) return false;

    this.lives--;
    if (this.lives > 0) {
      this.invulnerable = true;
      this.invulnerableTime = 120; // 2 seconds at 60fps
    }
    return true;
  }

  heal(amount) {
    this.lives = Math.min(this.lives + amount, this.maxLives);
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}
