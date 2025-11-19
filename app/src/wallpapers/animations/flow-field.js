/**
 * Flow Field Animation
 * Particles following a noise-based flow field
 */

export function startFlowField(canvas, intensity = 5, colorPalette = 'purple') {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const palettes = {
    purple: ['#8B5CF6', '#3B82F6', '#EC4899'],
    teal: ['#06B6D4', '#10B981', '#14B8A6'],
    pink: ['#EC4899', '#F97316', '#EF4444'],
    mono: ['#6B7280', '#9CA3AF', '#E5E7EB']
  };

  const particleCount = 1000 * (intensity / 5);
  const particles = [];
  const colors = palettes[colorPalette];
  let animationFrame = null;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      history: [],
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  function noise(x, y) {
    return Math.sin(x * 0.01) * Math.cos(y * 0.01);
  }

  let time = 0;

  function animate() {
    ctx.fillStyle = 'rgba(14, 14, 26, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      const angle = noise(p.x, p.y + time) * Math.PI * 2;
      const speed = 0.5 * (intensity / 5);

      p.x += Math.cos(angle) * speed;
      p.y += Math.sin(angle) * speed;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      p.history.push({ x: p.x, y: p.y });
      if (p.history.length > 20) p.history.shift();

      ctx.beginPath();
      p.history.forEach((pos, i) => {
        if (i === 0) {
          ctx.moveTo(pos.x, pos.y);
        } else {
          ctx.lineTo(pos.x, pos.y);
        }
      });

      const alpha = Math.floor(0.3 * 255).toString(16).padStart(2, '0');
      ctx.strokeStyle = p.color + alpha;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    time += 0.5;
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
