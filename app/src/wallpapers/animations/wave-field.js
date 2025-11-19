/**
 * Wave Field Animation
 * Flowing sine waves with multiple layers
 */

export function startWaveField(canvas, intensity = 5, colorPalette = 'purple') {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const palettes = {
    purple: ['#8B5CF6', '#3B82F6', '#EC4899'],
    teal: ['#06B6D4', '#10B981', '#14B8A6'],
    pink: ['#EC4899', '#F97316', '#EF4444'],
    mono: ['#6B7280', '#9CA3AF', '#E5E7EB']
  };

  const colors = palettes[colorPalette];
  let time = 0;
  let animationFrame = null;

  function animate() {
    ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const waves = 3 + Math.floor(intensity / 3);
    for (let w = 0; w < waves; w++) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);

      const amplitude = 30 + (w * 15) * (intensity / 5);
      const frequency = 0.002 + (w * 0.001);
      const speed = 0.3 + (w * 0.2) * (intensity / 5);

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * frequency + time * speed) * amplitude;
        ctx.lineTo(x, y);
      }

      const alpha = Math.floor((0.15 - w * 0.03) * 255).toString(16).padStart(2, '0');
      ctx.strokeStyle = colors[w % colors.length] + alpha;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    time += 0.02;
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
