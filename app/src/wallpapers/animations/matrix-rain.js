/**
 * Matrix Rain Animation
 * Digital rain effect inspired by The Matrix
 */

export function startMatrixRain(canvas, intensity = 5, colorPalette = 'mono') {
  console.log('[Matrix Rain] Starting animation', { intensity, colorPalette });

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const palettes = {
    purple: { primary: '#8B5CF6', secondary: '#3B82F6' },
    teal: { primary: '#06B6D4', secondary: '#10B981' },
    pink: { primary: '#EC4899', secondary: '#F97316' },
    mono: { primary: '#0F0', secondary: '#00FF00' }
  };

  // Characters to use - Katakana and alphanumeric
  const matrix = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const matrixArray = matrix.split("");

  // Adjust font size and speed based on intensity
  const fontSize = 12 + (intensity * 2);
  const speed = 25 + (10 - intensity) * 5; // Lower intensity = slower (higher ms)
  const columns = Math.floor(canvas.width / fontSize);
  const colors = palettes[colorPalette] || palettes.mono;

  // Array to track drop position for each column
  const drops = [];
  for (let x = 0; x < columns; x++) {
    drops[x] = Math.floor(Math.random() * canvas.height / fontSize) * -1; // Start above screen
  }

  console.log('[Matrix Rain] Initialized with', columns, 'columns, font size:', fontSize, 'speed:', speed);

  let animationFrame = null;
  let lastTime = 0;

  function animate(currentTime) {
    if (currentTime - lastTime < speed) {
      animationFrame = requestAnimationFrame(animate);
      return;
    }
    lastTime = currentTime;

    // Black background with slight opacity for fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text styling
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'center';

    // Draw characters
    for (let i = 0; i < drops.length; i++) {
      // Random character from matrix
      const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];

      // Bright head of the trail
      ctx.fillStyle = colors.primary;
      ctx.fillText(text, i * fontSize + fontSize / 2, drops[i] * fontSize);

      // Add dimmer trail characters above
      for (let j = 1; j <= 5; j++) {
        const trailY = (drops[i] - j) * fontSize;
        if (trailY > 0) {
          const alpha = (6 - j) / 6;
          ctx.fillStyle = `rgba(0, 255, 0, ${alpha * 0.5})`;
          const trailText = matrixArray[Math.floor(Math.random() * matrixArray.length)];
          ctx.fillText(trailText, i * fontSize + fontSize / 2, trailY);
        }
      }

      // Reset drop to top randomly after it has crossed the screen
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      // Increment drop position
      drops[i]++;
    }

    animationFrame = requestAnimationFrame(animate);
  }

  animate(0);

  // Handle window resize
  const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Recalculate columns
    const newColumns = Math.floor(canvas.width / fontSize);
    drops.length = newColumns;
    for (let x = 0; x < newColumns; x++) {
      if (drops[x] === undefined) {
        drops[x] = Math.floor(Math.random() * canvas.height / fontSize) * -1;
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
