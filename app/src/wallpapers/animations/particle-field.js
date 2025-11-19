/**
 * Particle Field Animation
 * Floating particles with pulsing alpha
 */

export function startParticleField(canvas, intensity = 5, colorPalette = 'purple') {
  console.log('[Particle Field] Starting animation', { intensity, colorPalette });

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const palettes = {
    purple: ['#8B5CF6', '#3B82F6', '#EC4899'],
    teal: ['#06B6D4', '#10B981', '#14B8A6'],
    pink: ['#EC4899', '#F97316', '#EF4444'],
    mono: ['#6B7280', '#9CA3AF', '#E5E7EB']
  };

  const particleCount = Math.floor(800 * (intensity / 5));
  const particles = [];
  const colors = palettes[colorPalette] || palettes.purple;
  let animationFrame = null;

  // Create particles with more variety
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8 * (intensity / 5),
      vy: (Math.random() - 0.5) * 0.8 * (intensity / 5),
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed: 0.5 + Math.random() * 1.5
    });
  }

  console.log('[Particle Field] Created', particleCount, 'particles');

  function animate() {
    // Darker trail for more contrast
    ctx.fillStyle = 'rgba(26, 26, 62, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.001;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Pulsing alpha effect
      const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.5 + 0.5;
      const alpha = 0.4 + pulse * 0.6;

      // Draw particle with glow
      const glowRadius = p.size * 4;
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
      const hexAlpha = Math.floor(alpha * 255).toString(16).padStart(2, '0');

      gradient.addColorStop(0, p.color + 'FF');
      gradient.addColorStop(0.4, p.color + hexAlpha);
      gradient.addColorStop(1, p.color + '00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw bright core
      ctx.fillStyle = p.color + 'FF';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    animationFrame = requestAnimationFrame(animate);
  }

  animate();

  // Return stop function
  return () => {
    console.log('[Particle Field] Stopping animation');
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
}
