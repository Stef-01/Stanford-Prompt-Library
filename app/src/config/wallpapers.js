/**
 * Wallpaper Configuration
 * Defines all available wallpapers and their properties
 */

export const wallpapers = [
  {
    id: 'gradient-default',
    name: 'Stanford Gradient',
    type: 'css',
    emoji: '🎓',
    description: 'Original Stanford gradient background',
    css: `
      radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)
    `,
    backgroundColor: '#0A0F1E'
  },
  {
    id: 'neural',
    name: 'Neural Network',
    type: 'canvas',
    emoji: '🧠',
    description: 'Animated neural network with interconnected nodes',
    animation: 'neural-network',
    backgroundColor: '#0A0F1E'
  },
  {
    id: 'waves',
    name: 'Wave Field',
    type: 'canvas',
    emoji: '🌊',
    description: 'Flowing sine waves in multiple layers',
    animation: 'wave-field',
    backgroundColor: '#1a1a2e'
  },
  {
    id: 'particles',
    name: 'Particle Field',
    type: 'canvas',
    emoji: '✨',
    description: 'Floating particles with pulsing effects',
    animation: 'particle-field',
    backgroundColor: '#1a1a3e'
  },
  {
    id: 'gradient-mesh',
    name: 'Gradient Mesh',
    type: 'css-animation',
    emoji: '🎨',
    description: 'Floating blurred gradient orbs',
    animation: 'gradient-mesh',
    backgroundColor: '#0f0f1f'
  },
  {
    id: 'flow-field',
    name: 'Flow Field',
    type: 'canvas',
    emoji: '🌀',
    description: 'Particles following a flow field pattern',
    animation: 'flow-field',
    backgroundColor: '#0e0e1a'
  }
];

export const colorPalettes = {
  purple: {
    name: 'Purple',
    colors: ['#8B5CF6', '#3B82F6', '#EC4899'],
    gradient: 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
  },
  teal: {
    name: 'Teal',
    colors: ['#06B6D4', '#10B981', '#14B8A6'],
    gradient: 'linear-gradient(135deg, #06B6D4, #10B981)'
  },
  pink: {
    name: 'Pink',
    colors: ['#EC4899', '#F97316', '#EF4444'],
    gradient: 'linear-gradient(135deg, #EC4899, #F97316)'
  },
  mono: {
    name: 'Monochrome',
    colors: ['#6B7280', '#9CA3AF', '#E5E7EB'],
    gradient: 'linear-gradient(135deg, #6B7280, #E5E7EB)'
  }
};

export const DEFAULT_WALLPAPER = 'gradient-default';
export const DEFAULT_INTENSITY = 5;
export const DEFAULT_PALETTE = 'purple';
