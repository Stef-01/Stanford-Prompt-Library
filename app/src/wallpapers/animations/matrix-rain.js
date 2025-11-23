/**
 * Matrix Rain Animation
 * Clean digital rain effect without overlays
 */

export function startMatrixRain(canvas, intensity = 5, colorPalette = 'mono') {
  console.log('[Matrix Rain] Starting animation', { intensity, colorPalette });

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Enable high-DPI rendering
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
    mono: { primary: '#00FF41', secondary: '#00FF00', glow: 'rgba(0, 255, 65, 0.8)' }
  };

  // Characters - authentic Matrix set
  const matrix = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ:・.\"=*+-<>¦";
  const matrixArray = matrix.split("");

  // Font size adjusted to prevent overlap
  const fontSize = 14 + (intensity * 1);
  const speed = 30 + (10 - intensity) * 4;
  const columns = Math.floor(window.innerWidth / fontSize);
  const colors = palettes[colorPalette] || palettes.mono;

  // Drop state
  const drops = [];
  const dropSpeeds = [];
  const brightness = [];

  for (let x = 0; x < columns; x++) {
    drops[x] = 0;
    dropSpeeds[x] = 0.5 + Math.random() * 0.5;
    brightness[x] = 0.5 + Math.random() * 0.5;
  }

  let animationFrame = null;
  let lastTime = 0;
  let isInitialWipe = true;
  let wipeComplete = false;

  function animate(currentTime) {
    if (currentTime - lastTime < speed) {
      animationFrame = requestAnimationFrame(animate);
      return;
    }
    lastTime = currentTime;

    // Semi-transparent background for fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // High-quality text rendering
    ctx.font = `${fontSize}px "Courier New", monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Enable smoother text
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Initial screen wipe effect
    if (isInitialWipe) {
      let allComplete = true;
      for (let i = 0; i < drops.length; i++) {
        if (drops[i] * fontSize < window.innerHeight) {
          allComplete = false;
        }
      }

      if (allComplete) {
        isInitialWipe = false;
        wipeComplete = true;
        // Reset drops for continuous rain
        for (let x = 0; x < columns; x++) {
          drops[x] = Math.floor(Math.random() * window.innerHeight / fontSize) * -1;
        }
      }
    }

    // Draw characters
    for (let i = 0; i < drops.length; i++) {
      const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Bright head of the trail
      ctx.shadowBlur = 10;
      ctx.shadowColor = colors.primary;
      ctx.fillStyle = colors.primary;
      ctx.globalAlpha = brightness[i];
      ctx.fillText(text, x, y);

      // Trail effect - dimmer characters above
      const trailLength = 6 + Math.floor(intensity / 3);
      for (let j = 1; j <= trailLength; j++) {
        const trailY = y - j * fontSize;
        if (trailY > 0) {
          const alpha = ((trailLength - j) / trailLength) * 0.4 * brightness[i];
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 3;
          const trailText = matrixArray[Math.floor(Math.random() * matrixArray.length)];
          ctx.fillText(trailText, x, trailY);
        }
      }

      // Random bright flashes (less frequent)
      if (Math.random() > 0.985) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 15;
        ctx.fillText(text, x, y);
      }

      // Reset logic
      if (wipeComplete) {
        // Normal rain mode - reset randomly
        if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.975) {
          drops[i] = 0;
          brightness[i] = 0.5 + Math.random() * 0.5;
        }
      }

      // Increment with variable speed
      drops[i] += dropSpeeds[i] * (intensity / 5);
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    animationFrame = requestAnimationFrame(animate);
  }

  animate(0);

  // Handle window resize
  const handleResize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);

    const newColumns = Math.floor(window.innerWidth / fontSize);
    drops.length = newColumns;
    dropSpeeds.length = newColumns;
    brightness.length = newColumns;

    for (let x = 0; x < newColumns; x++) {
      if (drops[x] === undefined) {
        drops[x] = Math.floor(Math.random() * window.innerHeight / fontSize) * -1;
        dropSpeeds[x] = 0.5 + Math.random() * 0.5;
        brightness[x] = 0.5 + Math.random() * 0.5;
      }
    }
  };
  window.addEventListener('resize', handleResize);

  // Cleanup function
  return () => {
    console.log('[Matrix Rain] Stopping animation');
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    window.removeEventListener('resize', handleResize);
  };
}
