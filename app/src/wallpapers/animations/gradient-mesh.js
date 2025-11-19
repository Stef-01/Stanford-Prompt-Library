/**
 * Gradient Mesh Animation
 * Floating blurred orbs with smooth movement
 */

export function startGradientMesh(container, intensity = 5, colorPalette = 'purple') {
  container.innerHTML = '';

  const palettes = {
    purple: ['#8B5CF6', '#3B82F6', '#EC4899'],
    teal: ['#06B6D4', '#10B981', '#14B8A6'],
    pink: ['#EC4899', '#F97316', '#EF4444'],
    mono: ['#6B7280', '#9CA3AF', '#E5E7EB']
  };

  const colors = palettes[colorPalette];
  const orbCount = 2 + Math.floor(intensity / 3);
  const styleElements = [];

  for (let i = 0; i < orbCount; i++) {
    const orb = document.createElement('div');
    orb.style.position = 'absolute';
    orb.style.width = '600px';
    orb.style.height = '600px';
    orb.style.borderRadius = '50%';
    orb.style.filter = 'blur(80px)';
    orb.style.opacity = '0.4';
    orb.style.background = colors[i % colors.length];
    orb.style.pointerEvents = 'none';

    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    orb.style.left = startX + '%';
    orb.style.top = startY + '%';

    const duration = 15 - intensity;
    orb.style.animation = `float${i} ${duration}s ease-in-out infinite`;

    container.appendChild(orb);

    // Create keyframes
    const keyframes = `
      @keyframes float${i} {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px) scale(1.1); }
        50% { transform: translate(${(Math.random() - 0.5) * 150}px, ${(Math.random() - 0.5) * 150}px) scale(0.9); }
        75% { transform: translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px) scale(1.05); }
      }
    `;
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
    styleElements.push(style);
  }

  container.style.width = '100%';
  container.style.height = '100%';
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.overflow = 'hidden';
  container.style.background = '#0f0f1f';
  container.style.pointerEvents = 'none';

  // Return stop function
  return () => {
    container.innerHTML = '';
    styleElements.forEach(style => style.remove());
  };
}
