/**
 * Flow Field Animation
 * Particles following a noise-based flow field - Enhanced version
 */

export function startFlowField(canvas, intensity = 5, colorPalette = 'purple') {
  console.log('[Flow Field] Starting animation', { intensity, colorPalette });

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const palettes = {
    purple: ['#8B5CF6', '#3B82F6', '#EC4899'],
    teal: ['#06B6D4', '#10B981', '#14B8A6'],
    pink: ['#EC4899', '#F97316', '#EF4444'],
    mono: ['#6B7280', '#9CA3AF', '#E5E7EB']
  };

  const particleCount = Math.floor(1500 * (intensity / 5));
  const particles = [];
  const colors = palettes[colorPalette] || palettes.purple;
  let animationFrame = null;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      history: [],
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 0.3 + Math.random() * 0.5
    });
  }

  console.log('[Flow Field] Created', particleCount, 'particles');

  function noise(x, y) {
    return Math.sin(x * 0.008) * Math.cos(y * 0.008) +
           Math.sin(x * 0.015 + 10) * Math.cos(y * 0.015 + 10) * 0.5;
  }

  let time = 0;

  function animate() {
    // Subtle trail effect
    ctx.fillStyle = 'rgba(14, 14, 26, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      const angle = noise(p.x, p.y + time) * Math.PI * 4;
      const speed = p.speed * (intensity / 5);

      p.x += Math.cos(angle) * speed;
      p.y += Math.sin(angle) * speed;

      // Wrap around edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      p.history.push({ x: p.x, y: p.y });
      if (p.history.length > 30) p.history.shift();

      // Draw trail with gradient
      if (p.history.length > 1) {
        ctx.beginPath();
        p.history.forEach((pos, i) => {
          if (i === 0) {
            ctx.moveTo(pos.x, pos.y);
          } else {
            ctx.lineTo(pos.x, pos.y);
          }
        });

        const trailAlpha = Math.floor(0.5 * 255).toString(16).padStart(2, '0');
        ctx.strokeStyle = p.color + trailAlpha;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw particle head with glow
      const headGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 5);
      headGradient.addColorStop(0, p.color + 'FF');
      headGradient.addColorStop(1, p.color + '00');

      ctx.fillStyle = headGradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    time += 0.3 * (intensity / 5);
    animationFrame = requestAnimationFrame(animate);
  }

  animate();

  // Return stop function
  return () => {
    console.log('[Flow Field] Stopping animation');
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
}
