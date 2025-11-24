/**
 * Stanford Insignia Animation
 * Animated Stanford logo with grid background
 */

export function startStanfordInsignia(canvas, intensity = 5, colorPalette = 'purple') {
  console.log('[Stanford Insignia] Starting animation', { intensity, colorPalette });

  const ctx = canvas.getContext('2d');

  // High-DPI rendering
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);

  const palettes = {
    purple: { primary: '#8B5CF6', secondary: '#3B82F6', glow: 'rgba(139, 92, 246, 0.8)' },
    teal: { primary: '#06B6D4', secondary: '#10B981', glow: 'rgba(6, 182, 212, 0.8)' },
    pink: { primary: '#EC4899', secondary: '#F97316', glow: 'rgba(236, 72, 153, 0.8)' },
    mono: { primary: '#FFFFFF', secondary: '#E5E7EB', glow: 'rgba(255, 255, 255, 0.8)' }
  };

  const colors = palettes[colorPalette] || palettes.purple;
  let animationFrame = null;
  let rotation = 0;
  let pulse = 0;

  // Draw glowing Stanford "S" logo
  function drawStanfordLogo() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const scale = Math.min(window.innerWidth, window.innerHeight) / 4;

    // Pulsing effect
    const pulseScale = 1 + Math.sin(pulse) * 0.05;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.scale(pulseScale, pulseScale);

    // Glow effect
    ctx.shadowBlur = 40 + Math.sin(pulse * 2) * 10;
    ctx.shadowColor = colors.glow;

    // Draw Stanford "S" outline
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.3;

    // Outer octagonal border
    ctx.beginPath();
    const sides = 8;
    const radius = scale;
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Inner "S" shape - stylized Stanford S
    ctx.beginPath();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.4;

    // Top curve of S
    ctx.moveTo(-scale * 0.3, -scale * 0.4);
    ctx.bezierCurveTo(
      -scale * 0.3, -scale * 0.6,
      scale * 0.3, -scale * 0.6,
      scale * 0.3, -scale * 0.4
    );
    ctx.bezierCurveTo(
      scale * 0.3, -scale * 0.2,
      -scale * 0.1, -scale * 0.2,
      -scale * 0.1, 0
    );

    // Bottom curve of S
    ctx.bezierCurveTo(
      -scale * 0.1, 0.2 * scale,
      scale * 0.3, 0.2 * scale,
      scale * 0.3, 0.4 * scale
    );
    ctx.bezierCurveTo(
      scale * 0.3, 0.6 * scale,
      -scale * 0.3, 0.6 * scale,
      -scale * 0.3, 0.4 * scale
    );
    ctx.stroke();

    // Tree in center (Stanford tree)
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    // Tree trunk
    ctx.fillRect(-scale * 0.05, scale * 0.1, scale * 0.1, scale * 0.2);
    // Tree foliage - triangular
    ctx.moveTo(0, -scale * 0.5);
    ctx.lineTo(-scale * 0.2, scale * 0.1);
    ctx.lineTo(scale * 0.2, scale * 0.1);
    ctx.closePath();
    ctx.fill();

    // Grid lines for tech effect
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1 + Math.sin(pulse) * 0.05;
    const gridSize = 20;
    for (let i = -radius; i <= radius; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, -radius);
      ctx.lineTo(i, radius);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-radius, i);
      ctx.lineTo(radius, i);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw animated grid background
  function drawGridBackground() {
    ctx.save();
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.05;

    const gridSize = 40;
    const offsetX = (pulse * 2) % gridSize;
    const offsetY = (pulse * 2) % gridSize;

    // Vertical lines
    for (let x = -gridSize; x < window.innerWidth + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + offsetX, 0);
      ctx.lineTo(x + offsetX, window.innerHeight);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = -gridSize; y < window.innerHeight + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y + offsetY);
      ctx.lineTo(window.innerWidth, y + offsetY);
      ctx.stroke();
    }

    ctx.restore();
  }

  function animate() {
    // Clear canvas
    ctx.fillStyle = 'rgba(10, 15, 30, 1)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // Draw background grid
    drawGridBackground();

    // Draw logo
    drawStanfordLogo();

    // Update animation values
    rotation += 0.001 * (intensity / 5);
    pulse += 0.02 * (intensity / 5);

    animationFrame = requestAnimationFrame(animate);
  }

  animate();

  // Handle window resize
  const handleResize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
  };
  window.addEventListener('resize', handleResize);

  // Cleanup function
  return () => {
    console.log('[Stanford Insignia] Stopping animation');
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    window.removeEventListener('resize', handleResize);
  };
}
