/**
 * Wallpaper Service
 * Manages wallpaper state, application, and persistence
 */

import { wallpapers, DEFAULT_WALLPAPER, DEFAULT_INTENSITY, DEFAULT_PALETTE } from '../config/wallpapers.js';
import { startNeuralNetwork } from '../wallpapers/animations/neural-network.js';
import { startWaveField } from '../wallpapers/animations/wave-field.js';
import { startParticleField } from '../wallpapers/animations/particle-field.js';
import { startGradientMesh } from '../wallpapers/animations/gradient-mesh.js';
import { startFlowField } from '../wallpapers/animations/flow-field.js';
import { startMatrixRain } from '../wallpapers/animations/matrix-rain.js';
import { startStanfordInsignia } from '../wallpapers/animations/stanford-insignia.js';

// Storage keys
const STORAGE_WALLPAPER = 'stanford-wallpaper-id';
const STORAGE_INTENSITY = 'stanford-wallpaper-intensity';
const STORAGE_PALETTE = 'stanford-wallpaper-palette';

// State
let currentWallpaper = null;
let currentIntensity = DEFAULT_INTENSITY;
let currentPalette = DEFAULT_PALETTE;
let currentStopFunction = null;
let backgroundCanvas = null;
let backgroundContainer = null;

/**
 * Initialize wallpaper system
 */
export function initWallpaper() {
  // Load saved settings
  const savedWallpaperId = localStorage.getItem(STORAGE_WALLPAPER) || DEFAULT_WALLPAPER;
  const savedIntensity = parseInt(localStorage.getItem(STORAGE_INTENSITY)) || DEFAULT_INTENSITY;
  const savedPalette = localStorage.getItem(STORAGE_PALETTE) || DEFAULT_PALETTE;

  currentIntensity = savedIntensity;
  currentPalette = savedPalette;

  // Find wallpaper
  const wallpaper = wallpapers.find(w => w.id === savedWallpaperId) || wallpapers[0];

  // Apply wallpaper
  applyWallpaper(wallpaper, currentIntensity, currentPalette);
}

/**
 * Apply wallpaper to desktop
 */
function applyWallpaper(wallpaper, intensity, palette) {
  console.log('[Wallpaper Service] Applying wallpaper:', {
    wallpaper: wallpaper.id,
    type: wallpaper.type,
    intensity,
    palette
  });

  const desktop = document.querySelector('body.desktop-mode');
  if (!desktop) {
    console.warn('[Wallpaper Service] Desktop mode not active');
    currentWallpaper = wallpaper;
    return;
  }

  console.log('[Wallpaper Service] Desktop element found:', desktop);

  // Stop current animation if any
  if (currentStopFunction) {
    console.log('[Wallpaper Service] Stopping previous animation');
    currentStopFunction();
    currentStopFunction = null;
  }

  // Clean up existing elements
  if (backgroundCanvas) {
    console.log('[Wallpaper Service] Removing previous canvas');
    backgroundCanvas.remove();
    backgroundCanvas = null;
  }
  if (backgroundContainer) {
    console.log('[Wallpaper Service] Removing previous container');
    backgroundContainer.remove();
    backgroundContainer = null;
  }

  // Set background color
  desktop.style.backgroundColor = wallpaper.backgroundColor || '#0A0F1E';

  // Apply wallpaper based on type
  if (wallpaper.type === 'css') {
    console.log('[Wallpaper Service] Applying CSS wallpaper');
    desktop.style.backgroundImage = wallpaper.css;
    desktop.style.backgroundSize = 'cover';
    desktop.style.backgroundPosition = 'center';
    desktop.style.backgroundRepeat = 'no-repeat';
  } else if (wallpaper.type === 'canvas') {
    console.log('[Wallpaper Service] Creating canvas wallpaper');
    // Clear CSS background
    desktop.style.backgroundImage = 'none';

    // Create canvas element
    backgroundCanvas = document.createElement('canvas');
    backgroundCanvas.id = 'wallpaper-canvas';
    backgroundCanvas.style.position = 'fixed';
    backgroundCanvas.style.top = '0';
    backgroundCanvas.style.left = '0';
    backgroundCanvas.style.width = '100%';
    backgroundCanvas.style.height = '100%';
    backgroundCanvas.style.zIndex = '0';
    backgroundCanvas.style.pointerEvents = 'none';
    desktop.insertBefore(backgroundCanvas, desktop.firstChild);

    console.log('[Wallpaper Service] Canvas created, starting animation:', wallpaper.animation);

    // Start animation
    currentStopFunction = startCanvasAnimation(wallpaper.animation, backgroundCanvas, intensity, palette);

    console.log('[Wallpaper Service] Animation started, canvas in DOM:', document.getElementById('wallpaper-canvas') !== null);
  } else if (wallpaper.type === 'css-animation') {
    console.log('[Wallpaper Service] Creating CSS animation wallpaper');
    // Clear CSS background
    desktop.style.backgroundImage = 'none';

    // Create container element for gradient mesh
    backgroundContainer = document.createElement('div');
    backgroundContainer.id = 'wallpaper-container';
    backgroundContainer.style.position = 'fixed';
    backgroundContainer.style.top = '0';
    backgroundContainer.style.left = '0';
    backgroundContainer.style.width = '100%';
    backgroundContainer.style.height = '100%';
    backgroundContainer.style.zIndex = '0';
    backgroundContainer.style.pointerEvents = 'none';
    desktop.insertBefore(backgroundContainer, desktop.firstChild);

    console.log('[Wallpaper Service] Container created, starting CSS animation');

    // Start CSS animation
    currentStopFunction = startGradientMesh(backgroundContainer, intensity, palette);

    console.log('[Wallpaper Service] CSS animation started');
  }

  currentWallpaper = wallpaper;
  console.log('[Wallpaper Service] Wallpaper applied successfully');
}

/**
 * Start canvas animation
 */
function startCanvasAnimation(animationName, canvas, intensity, palette) {
  switch (animationName) {
    case 'neural-network':
      return startNeuralNetwork(canvas, intensity, palette);
    case 'wave-field':
      return startWaveField(canvas, intensity, palette);
    case 'particle-field':
      return startParticleField(canvas, intensity, palette);
    case 'flow-field':
      return startFlowField(canvas, intensity, palette);
    case 'matrix-rain':
      return startMatrixRain(canvas, intensity, palette);
    case 'stanford-insignia':
      return startStanfordInsignia(canvas, intensity, palette);
    default:
      console.error('Unknown animation:', animationName);
      return () => {};
  }
}

/**
 * Set wallpaper by ID
 */
export function setWallpaper(wallpaperId) {
  const wallpaper = wallpapers.find(w => w.id === wallpaperId);
  if (!wallpaper) {
    console.error('Wallpaper not found:', wallpaperId);
    return false;
  }

  applyWallpaper(wallpaper, currentIntensity, currentPalette);
  localStorage.setItem(STORAGE_WALLPAPER, wallpaperId);
  return true;
}

/**
 * Set intensity (1-10)
 */
export function setIntensity(intensity) {
  if (intensity < 1 || intensity > 10) {
    console.error('Intensity must be between 1 and 10');
    return false;
  }

  currentIntensity = intensity;
  localStorage.setItem(STORAGE_INTENSITY, intensity.toString());

  // Reapply current wallpaper with new intensity
  if (currentWallpaper) {
    applyWallpaper(currentWallpaper, currentIntensity, currentPalette);
  }

  return true;
}

/**
 * Set color palette
 */
export function setColorPalette(palette) {
  if (!['purple', 'teal', 'pink', 'mono'].includes(palette)) {
    console.error('Invalid palette:', palette);
    return false;
  }

  currentPalette = palette;
  localStorage.setItem(STORAGE_PALETTE, palette);

  // Reapply current wallpaper with new palette
  if (currentWallpaper) {
    applyWallpaper(currentWallpaper, currentIntensity, currentPalette);
  }

  return true;
}

/**
 * Get current wallpaper
 */
export function getCurrentWallpaper() {
  return currentWallpaper;
}

/**
 * Get current intensity
 */
export function getCurrentIntensity() {
  return currentIntensity;
}

/**
 * Get current color palette
 */
export function getCurrentPalette() {
  return currentPalette;
}

/**
 * Get all wallpapers
 */
export function getAllWallpapers() {
  return wallpapers;
}

/**
 * Handle window resize
 */
export function handleResize() {
  if (currentWallpaper && (currentWallpaper.type === 'canvas' || currentWallpaper.type === 'css-animation')) {
    // Reapply to resize canvas/container
    applyWallpaper(currentWallpaper, currentIntensity, currentPalette);
  }
}

// Listen for window resize
if (typeof window !== 'undefined') {
  window.addEventListener('resize', handleResize);
}
