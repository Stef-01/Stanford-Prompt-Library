/**
 * Matrix Rain Animation
 * Falling characters effect inspired by The Matrix
 */

export function startMatrixRain(canvas, intensity = 5, colorPalette = 'green') {
  console.log('[Matrix Rain] Starting animation', { intensity, colorPalette });

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Color palettes
  const palettes = {
    green: ['#0F0', '#00FF00', '#00DD00'],      // Classic Matrix green
    cyan: ['#00FFF0', '#00DDDD', '#00BBBB'],    // Cyan variant
    purple: ['#8B5CF6', '#A78BFA', '#C4B5FD'], // Purple variant
    pink: ['#FF00FF', '#DD00DD', '#BB00BB'],    // Pink variant
    mono: ['#FFFFFF', '#DDDDDD', '#BBBBBB']     // White/mono variant
  };

  const colors = palettes[colorPalette] || palettes.green;

  // Characters to use - Japanese katakana + numbers + letters
  const matrix = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const matrixArray = matrix.split("");

  // Calculate font size and columns based on intensity
  // Higher intensity = smaller characters = more columns = denser effect
  const fontSize = Math.max(10, 18 - intensity);
  const columns = Math.floor(canvas.width / fontSize);

  // Array to track drop position for each column
  const drops = [];
  for (let x = 0; x < columns; x++) {
    drops[x] = Math.floor(Math.random() * canvas.height / fontSize) * -1; // Stagger start positions
  }

  // Speed varies with intensity
  const baseSpeed = 35; // milliseconds per frame
  const speed = Math.max(15, baseSpeed - (intensity * 3));

  console.log('[Matrix Rain] Configuration:', {
    fontSize,
    columns,
    speed: speed + 'ms',
    characterSet: matrixArray.length + ' chars'
  });

  let intervalId = null;
  let animationFrame = null;

  function draw() {
    // Black background with slight opacity for fade trail effect
    // Lower opacity = longer trails
    const fadeOpacity = 0.03 + (intensity * 0.005);
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text color and font
    ctx.fillStyle = colors[0];
    ctx.font = fontSize + 'px monospace';

    // Draw characters
    for (let i = 0; i < drops.length; i++) {
      // Random character from matrix
      const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];

      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Draw brighter character at the leading edge
      if (y > 0) {
        // Draw trail characters with reduced opacity
        ctx.fillStyle = colors[2] + '44'; // Low opacity for trail
        ctx.fillText(text, x, y - fontSize);

        // Draw main bright character
        ctx.fillStyle = colors[0] + 'FF'; // Full opacity
        ctx.fillText(text, x, y);

        // Add extra glow to leading character
        if (intensity >= 7) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors[0];
          ctx.fillText(text, x, y);
          ctx.shadowBlur = 0;
        }
      }

      // Reset drop to top randomly after it has crossed the screen
      // Higher intensity = more frequent resets = denser effect
      const resetChance = 0.975 - (intensity * 0.002);
      if (drops[i] * fontSize > canvas.height && Math.random() > resetChance) {
        drops[i] = 0;
      }

      // Increment drop position
      drops[i]++;
    }
  }

  // Start animation loop
  intervalId = setInterval(draw, speed);

  // Handle window resize
  const handleResize = () => {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Recalculate columns if width changed significantly
    if (Math.abs(canvas.width - oldWidth) > 100) {
      const newColumns = Math.floor(canvas.width / fontSize);
      // Adjust drops array
      if (newColumns > drops.length) {
        for (let i = drops.length; i < newColumns; i++) {
          drops[i] = Math.floor(Math.random() * canvas.height / fontSize) * -1;
        }
      } else if (newColumns < drops.length) {
        drops.length = newColumns;
      }
      console.log('[Matrix Rain] Resized to', newColumns, 'columns');
    }
  };

  window.addEventListener('resize', handleResize);

  // Return cleanup function
  return () => {
    console.log('[Matrix Rain] Stopping animation');
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    window.removeEventListener('resize', handleResize);
  };
}
