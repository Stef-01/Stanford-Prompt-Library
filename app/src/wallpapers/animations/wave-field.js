/**
 * Wave Field Animation
 * Flowing sine waves with multiple layers - Enhanced version
 */

export function startWaveField(canvas, intensity = 5, colorPalette = 'purple') {
  console.log('[Wave Field] Starting animation', { intensity, colorPalette });

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const palettes = {
    purple: ['#8B5CF6', '#3B82F6', '#EC4899'],
    teal: ['#06B6D4', '#10B981', '#14B8A6'],
    pink: ['#EC4899', '#F97316', '#EF4444'],
    mono: ['#6B7280', '#9CA3AF', '#E5E7EB']
  };

  const colors = palettes[colorPalette] || palettes.purple;
  let time = 0;
  let animationFrame = null;

  console.log('[Wave Field] Created with', colors);

  function animate() {
    ctx.fillStyle = 'rgba(26, 26, 46, 0.12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const waves = 5 + Math.floor(intensity / 2);

    for (let w = 0; w < waves; w++) {
      const amplitude = 50 + (w * 25) * (intensity / 5);
      const frequency = 0.003 + (w * 0.0015);
      const speed = 0.4 + (w * 0.3) * (intensity / 5);
      const yOffset = (canvas.height / (waves + 1)) * (w + 1);

      // Draw glow layer
      ctx.beginPath();
      ctx.moveTo(0, yOffset);

      for (let x = 0; x < canvas.width; x += 2) {
        const y = yOffset + Math.sin(x * frequency + time * speed) * amplitude;
        ctx.lineTo(x, y);
      }

      const alphaGlow = Math.floor(0.2 * 255).toString(16).padStart(2, '0');
      ctx.strokeStyle = colors[w % colors.length] + alphaGlow;
      ctx.lineWidth = 10;
      ctx.stroke();

      // Draw main line
      ctx.beginPath();
      ctx.moveTo(0, yOffset);

      for (let x = 0; x < canvas.width; x += 1) {
        const y = yOffset + Math.sin(x * frequency + time * speed) * amplitude;
        ctx.lineTo(x, y);
      }

      const alphaMain = Math.floor(0.6 * 255).toString(16).padStart(2, '0');
      ctx.strokeStyle = colors[w % colors.length] + alphaMain;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Add bright peaks
      for (let x = 0; x < canvas.width; x += 50) {
        const y = yOffset + Math.sin(x * frequency + time * speed) * amplitude;
        const peakGradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
        peakGradient.addColorStop(0, colors[w % colors.length] + 'CC');
        peakGradient.addColorStop(1, colors[w % colors.length] + '00');

        ctx.fillStyle = peakGradient;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    time += 0.02 * (intensity / 5);
    animationFrame = requestAnimationFrame(animate);
  }

  animate();

  // Return stop function
  return () => {
    console.log('[Wave Field] Stopping animation');
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
}
