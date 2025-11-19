/**
 * Particle Field Animation
 * Floating particles with pulsing alpha
 */

export function startParticleField(canvas, intensity = 5, colorPalette = 'purple') {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const palettes = {
    purple: ['#8B5CF6', '#3B82F6', '#EC4899'],
    teal: ['#06B6D4', '#10B981', '#14B8A6'],
    pink: ['#EC4899', '#F97316', '#EF4444'],
    mono: ['#6B7280', '#9CA3AF', '#E5E7EB']
  };

  const particleCount = 500 * (intensity / 5);
  const particles = [];
  const colors = palettes[colorPalette];
  let animationFrame = null;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5 * (intensity / 5),
      vy: (Math.random() - 0.5) * 0.5 * (intensity / 5),
      size: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random()
    });
  }

  function animate() {
    ctx.fillStyle = 'rgba(26, 26, 62, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      p.alpha = 0.3 + Math.sin(Date.now() * 0.001 + p.x) * 0.3;

      ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    animationFrame = requestAnimationFrame(animate);
  }

  animate();

  // Return stop function
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
}
