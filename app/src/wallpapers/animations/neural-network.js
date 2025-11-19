/**
 * Neural Network Animation
 * Animated nodes with interconnecting lines
 */

export function startNeuralNetwork(canvas, intensity = 5, colorPalette = 'purple') {
  console.log('[Neural Network] Starting animation', { intensity, colorPalette });

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const palettes = {
    purple: ['#8B5CF6', '#3B82F6', '#EC4899'],
    teal: ['#06B6D4', '#10B981', '#14B8A6'],
    pink: ['#EC4899', '#F97316', '#EF4444'],
    mono: ['#6B7280', '#9CA3AF', '#E5E7EB']
  };

  const nodeCount = 80 + (intensity * 10);
  const nodes = [];
  const colors = palettes[colorPalette] || palettes.purple;
  let animationFrame = null;

  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5 * (intensity / 5),
      vy: (Math.random() - 0.5) * 0.5 * (intensity / 5),
      radius: 3 + Math.random() * 3,
      pulseOffset: Math.random() * Math.PI * 2
    });
  }

  console.log('[Neural Network] Created', nodeCount, 'nodes');

  function animate() {
    // Semi-transparent background for trail effect
    ctx.fillStyle = 'rgba(10, 15, 30, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.001;

    // Update and draw nodes
    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off edges
      if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

      // Pulsing effect
      const pulse = Math.sin(time * 2 + node.pulseOffset) * 0.5 + 0.5;
      const nodeRadius = node.radius * (0.8 + pulse * 0.4);

      // Draw node with glow
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeRadius * 4);
      gradient.addColorStop(0, colors[0] + 'FF');
      gradient.addColorStop(0.3, colors[0] + 'AA');
      gradient.addColorStop(1, colors[0] + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius * 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw core
      ctx.fillStyle = colors[0] + 'FF';
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw connections with enhanced visibility
    const maxDist = 180 + (intensity * 10);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = Math.pow(1 - dist / maxDist, 2) * 0.6;
          const hexAlpha = Math.floor(alpha * 255).toString(16).padStart(2, '0');

          // Draw line with gradient
          const lineGradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
          lineGradient.addColorStop(0, colors[1] + hexAlpha);
          lineGradient.addColorStop(0.5, colors[2] + hexAlpha);
          lineGradient.addColorStop(1, colors[1] + hexAlpha);

          ctx.strokeStyle = lineGradient;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    animationFrame = requestAnimationFrame(animate);
  }

  animate();

  // Return stop function
  return () => {
    console.log('[Neural Network] Stopping animation');
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
}
