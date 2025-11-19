/**
 * Gradient Mesh Animation
 * Floating blurred orbs with smooth movement - Enhanced version
 */

export function startGradientMesh(container, intensity = 5, colorPalette = 'purple') {
  console.log('[Gradient Mesh] Starting animation', { intensity, colorPalette });

  container.innerHTML = '';

  const palettes = {
    purple: ['#8B5CF6', '#3B82F6', '#EC4899'],
    teal: ['#06B6D4', '#10B981', '#14B8A6'],
    pink: ['#EC4899', '#F97316', '#EF4444'],
    mono: ['#6B7280', '#9CA3AF', '#E5E7EB']
  };

  const colors = palettes[colorPalette] || palettes.purple;
  const orbCount = 3 + Math.floor(intensity / 2.5);
  const styleElements = [];

  console.log('[Gradient Mesh] Creating', orbCount, 'orbs with colors', colors);

  for (let i = 0; i < orbCount; i++) {
    const orb = document.createElement('div');
    orb.style.position = 'absolute';
    orb.style.width = '800px';
    orb.style.height = '800px';
    orb.style.borderRadius = '50%';
    orb.style.filter = 'blur(100px)';
    orb.style.opacity = '0.6';
    orb.style.background = colors[i % colors.length];
    orb.style.pointerEvents = 'none';
    orb.style.willChange = 'transform';

    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    orb.style.left = startX + '%';
    orb.style.top = startY + '%';
    orb.style.transform = 'translate(-50%, -50%)';

    const duration = 20 - (intensity * 1.5);
    orb.style.animation = `float${i} ${duration}s ease-in-out infinite`;

    container.appendChild(orb);

    // Create more dynamic keyframes
    const moveRange = 200 + (intensity * 20);
    const keyframes = `
      @keyframes float${i} {
        0%, 100% {
          transform: translate(-50%, -50%) scale(1);
        }
        25% {
          transform: translate(calc(-50% + ${(Math.random() - 0.5) * moveRange}px), calc(-50% + ${(Math.random() - 0.5) * moveRange}px)) scale(1.15);
        }
        50% {
          transform: translate(calc(-50% + ${(Math.random() - 0.5) * moveRange * 1.5}px), calc(-50% + ${(Math.random() - 0.5) * moveRange * 1.5}px)) scale(0.85);
        }
        75% {
          transform: translate(calc(-50% + ${(Math.random() - 0.5) * moveRange}px), calc(-50% + ${(Math.random() - 0.5) * moveRange}px)) scale(1.1);
        }
      }
    `;
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
    styleElements.push(style);
  }

  container.style.width = '100%';
  container.style.height = '100%';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.overflow = 'hidden';
  container.style.background = '#0f0f1f';
  container.style.pointerEvents = 'none';

  console.log('[Gradient Mesh] Animation started');

  // Return stop function
  return () => {
    console.log('[Gradient Mesh] Stopping animation');
    container.innerHTML = '';
    styleElements.forEach(style => style.remove());
  };
}
