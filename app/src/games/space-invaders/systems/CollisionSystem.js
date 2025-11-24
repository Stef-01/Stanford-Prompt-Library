/**
 * Collision Detection System
 */

export class CollisionSystem {
  static checkRectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  static checkCircleCollision(circle1, circle2) {
    const dx = circle1.centerX - circle2.centerX;
    const dy = circle1.centerY - circle2.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
  }

  static checkBulletInvaderCollisions(bullets, invaders) {
    const hits = [];

    for (let i = 0; i < bullets.length; i++) {
      const bullet = bullets[i];
      if (!bullet.active) continue;

      const bulletBounds = bullet.getBounds();
      const bulletCenter = {
        centerX: bulletBounds.x + bulletBounds.width / 2,
        centerY: bulletBounds.y + bulletBounds.height / 2,
        radius: bulletBounds.width / 2
      };

      for (let j = 0; j < invaders.length; j++) {
        const invader = invaders[j];
        if (!invader.alive) continue;

        const invaderBounds = invader.getBounds();

        // Use circle collision for bears
        if (this.checkCircleCollision(bulletCenter, invaderBounds)) {
          hits.push({ bullet, invader, bulletIndex: i, invaderIndex: j });
          bullet.active = false;
          break; // Bullet can only hit one invader
        }
      }
    }

    return hits;
  }

  static checkPlayerInvaderCollisions(player, invaders) {
    const playerBounds = player.getBounds();

    for (let invader of invaders) {
      if (!invader.alive) continue;

      const invaderBounds = invader.getBounds();

      // Simple rect collision for player
      if (this.checkRectCollision(playerBounds, invaderBounds)) {
        return invader;
      }
    }

    return null;
  }
}
