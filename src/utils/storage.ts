/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BallConfig, GameSettings, PlayerStats, Achievement } from '../types/ball';

export const DEFAULT_BALL: BallConfig = {
  id: 'default-ball',
  name: 'Magic Orb',
  color: '#3B82F6', // Vibrant blue
  gradient: 'none',
  material: 'glossy',
  pattern: 'none',
  patternColor: '#FFFFFF',
  patternScale: 3,
  shape: 'sphere',
  size: 1.0,
  eyes: {
    lockTogether: true,
    leftColor: '#10B981', // Emerald green
    rightColor: '#10B981',
    shape: 'cute-round',
    expression: 'happy',
    size: 1.0,
    spacing: 1.0,
    pupilSize: 1.0,
    pupilDirX: 0,
    pupilDirY: 0,
    shine: true,
  },
  accessory: 'none',
  accessoryColor: '#F59E0B',
  effect: 'none',
  effectIntensity: 1.0,
  isFavorite: false,
};

export const PRESET_BALLS: BallConfig[] = [
  {
    id: 'preset-galaxy',
    name: 'Galaxy Ball',
    color: '#312E81',
    gradient: 'galaxy',
    material: 'galaxy',
    pattern: 'stars',
    patternColor: '#EC4899',
    patternScale: 4,
    shape: 'sphere',
    size: 1.0,
    eyes: {
      lockTogether: true,
      leftColor: '#A855F7',
      rightColor: '#A855F7',
      shape: 'star',
      expression: 'excited',
      size: 1.1,
      spacing: 1.0,
      pupilSize: 1.1,
      pupilDirX: 0,
      pupilDirY: 0,
      shine: true,
    },
    accessory: 'crown',
    accessoryColor: '#FBBF24',
    effect: 'stars',
    effectIntensity: 1.2,
  },
  {
    id: 'preset-fire',
    name: 'Fire Ball',
    color: '#EF4444',
    gradient: 'fire',
    material: 'lava',
    pattern: 'flames',
    patternColor: '#FBBF24',
    patternScale: 3,
    shape: 'squishy',
    size: 1.05,
    eyes: {
      lockTogether: true,
      leftColor: '#F59E0B',
      rightColor: '#F59E0B',
      shape: 'angry',
      expression: 'angry',
      size: 0.95,
      spacing: 1.0,
      pupilSize: 0.9,
      pupilDirX: 0,
      pupilDirY: 0,
      shine: true,
    },
    accessory: 'horns',
    accessoryColor: '#991B1B',
    effect: 'fire-trail',
    effectIntensity: 1.4,
  },
  {
    id: 'preset-ice',
    name: 'Ice Ball',
    color: '#06B6D4',
    gradient: 'ice',
    material: 'ice',
    pattern: 'geometric',
    patternColor: '#E0F2FE',
    patternScale: 4,
    shape: 'sphere',
    size: 1.0,
    eyes: {
      lockTogether: true,
      leftColor: '#38BDF8',
      rightColor: '#38BDF8',
      shape: 'anime',
      expression: 'surprised',
      size: 1.05,
      spacing: 1.05,
      pupilSize: 1.0,
      pupilDirX: 0,
      pupilDirY: 0,
      shine: true,
    },
    accessory: 'wings',
    accessoryColor: '#BAE6FD',
    effect: 'ice-trail',
    effectIntensity: 1.1,
  },
  {
    id: 'preset-rainbow',
    name: 'Rainbow Ball',
    color: '#EC4899',
    gradient: 'rainbow',
    material: 'holographic',
    pattern: 'spirals',
    patternColor: '#FDE047',
    patternScale: 3,
    shape: 'jelly',
    size: 1.0,
    eyes: {
      lockTogether: false,
      leftColor: '#3B82F6',
      rightColor: '#EC4899',
      shape: 'large-cartoon',
      expression: 'excited',
      size: 1.15,
      spacing: 1.0,
      pupilSize: 1.1,
      pupilDirX: 0,
      pupilDirY: 0,
      shine: true,
    },
    accessory: 'bow',
    accessoryColor: '#F43F5E',
    effect: 'rainbow-trail',
    effectIntensity: 1.3,
  },
  {
    id: 'preset-golden',
    name: 'Golden Ball',
    color: '#D97706',
    gradient: 'none',
    material: 'gold',
    pattern: 'checkerboard',
    patternColor: '#FEF3C7',
    patternScale: 4,
    shape: 'sphere',
    size: 1.0,
    eyes: {
      lockTogether: true,
      leftColor: '#B45309',
      rightColor: '#B45309',
      shape: 'star',
      expression: 'happy',
      size: 1.0,
      spacing: 1.0,
      pupilSize: 0.95,
      pupilDirX: 0,
      pupilDirY: 0,
      shine: true,
    },
    accessory: 'crown',
    accessoryColor: '#F59E0B',
    effect: 'sparkles',
    effectIntensity: 1.2,
  },
  {
    id: 'preset-neon',
    name: 'Neon Ball',
    color: '#10B981',
    gradient: 'neon',
    material: 'neon',
    pattern: 'stripes',
    patternColor: '#06B6D4',
    patternScale: 5,
    shape: 'sphere',
    size: 1.0,
    eyes: {
      lockTogether: true,
      leftColor: '#22D3EE',
      rightColor: '#22D3EE',
      shape: 'neon',
      expression: 'excited',
      size: 1.0,
      spacing: 1.1,
      pupilSize: 1.0,
      pupilDirX: 0,
      pupilDirY: 0,
      shine: true,
    },
    accessory: 'sunglasses',
    accessoryColor: '#0F172A',
    effect: 'neon-glow',
    effectIntensity: 1.5,
  },
  {
    id: 'preset-crystal',
    name: 'Crystal Ball',
    color: '#818CF8',
    gradient: 'ocean',
    material: 'crystal',
    pattern: 'geometric',
    patternColor: '#C7D2FE',
    patternScale: 3,
    shape: 'puffy',
    size: 1.0,
    eyes: {
      lockTogether: true,
      leftColor: '#6366F1',
      rightColor: '#6366F1',
      shape: 'anime',
      expression: 'love-struck',
      size: 1.1,
      spacing: 1.0,
      pupilSize: 1.0,
      pupilDirX: 0,
      pupilDirY: 0,
      shine: true,
    },
    accessory: 'flower',
    accessoryColor: '#F472B6',
    effect: 'magical-aura',
    effectIntensity: 1.2,
  },
  {
    id: 'preset-robot',
    name: 'Robot Ball',
    color: '#475569',
    gradient: 'none',
    material: 'chrome',
    pattern: 'checkerboard',
    patternColor: '#94A3B8',
    patternScale: 4,
    shape: 'sphere',
    size: 1.0,
    eyes: {
      lockTogether: true,
      leftColor: '#06B6D4',
      rightColor: '#06B6D4',
      shape: 'robot',
      expression: 'confused',
      size: 0.95,
      spacing: 1.05,
      pupilSize: 0.8,
      pupilDirX: 0,
      pupilDirY: 0,
      shine: false,
    },
    accessory: 'headphones',
    accessoryColor: '#0284C7',
    effect: 'lightning',
    effectIntensity: 1.1,
  },
  {
    id: 'preset-candy',
    name: 'Candy Ball',
    color: '#F43F5E',
    gradient: 'candy',
    material: 'jelly',
    pattern: 'dots',
    patternColor: '#FEF08A',
    patternScale: 4,
    shape: 'squishy',
    size: 1.05,
    eyes: {
      lockTogether: true,
      leftColor: '#EC4899',
      rightColor: '#EC4899',
      shape: 'heart',
      expression: 'laughing',
      size: 1.1,
      spacing: 1.0,
      pupilSize: 1.1,
      pupilDirX: 0,
      pupilDirY: 0,
      shine: true,
    },
    accessory: 'hat',
    accessoryColor: '#38BDF8',
    effect: 'sparkles',
    effectIntensity: 1.0,
  },
  {
    id: 'preset-shadow',
    name: 'Shadow Ball',
    color: '#0F172A',
    gradient: 'none',
    material: 'rubber',
    pattern: 'lightning',
    patternColor: '#818CF8',
    patternScale: 3,
    shape: 'sphere',
    size: 1.0,
    eyes: {
      lockTogether: true,
      leftColor: '#EF4444',
      rightColor: '#EF4444',
      shape: 'angry',
      expression: 'angry',
      size: 1.0,
      spacing: 1.0,
      pupilSize: 0.9,
      pupilDirX: 0,
      pupilDirY: 0,
      shine: false,
    },
    accessory: 'mask',
    accessoryColor: '#312E81',
    effect: 'magical-aura',
    effectIntensity: 1.3,
  },
];

export const INITIAL_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  muted: false,
  graphicsQuality: 'high',
  shadows: true,
  glow: true,
  particleIntensity: 1.0,
  reducedMotion: false,
  mouseSensitivity: 1.0,
  touchSensitivity: 1.0,
  difficulty: 'normal',
  controlHints: true,
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-level',
    title: 'First Step',
    description: 'Complete the first level of Arcade Mode',
    rewardCoins: 50,
    progress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    icon: '🏆',
  },
  {
    id: 'stars-100',
    title: 'Star Collector',
    description: 'Collect 100 stars across all levels and modes',
    rewardCoins: 150,
    progress: 0,
    maxProgress: 100,
    completed: false,
    claimed: false,
    icon: '⭐',
  },
  {
    id: 'colors-5',
    title: 'Chameleon',
    description: 'Experiment with at least 5 different ball colors',
    rewardCoins: 40,
    progress: 1,
    maxProgress: 5,
    completed: false,
    claimed: false,
    icon: '🎨',
  },
  {
    id: 'custom-eye',
    title: 'Gazing Soul',
    description: 'Create a custom eye design with distinct left/right colors',
    rewardCoins: 60,
    progress: 0,
    maxProgress: 1,
    completed: false,
    claimed: false,
    icon: '👁️',
  },
  {
    id: 'save-3',
    title: 'Fashion Wardrobe',
    description: 'Save 3 custom ball styles in My Balls',
    rewardCoins: 80,
    progress: 0,
    maxProgress: 3,
    completed: false,
    claimed: false,
    icon: '💾',
  },
  {
    id: 'levels-5',
    title: 'Arcade Master',
    description: 'Complete all 5 arcade levels',
    rewardCoins: 300,
    progress: 0,
    maxProgress: 5,
    completed: false,
    claimed: false,
    icon: '👑',
  },
];

const STORAGE_KEYS = {
  CURRENT_BALL: 'magic_ball_current',
  SAVED_LOOKS: 'magic_ball_saved_looks',
  FAVORITES: 'magic_ball_favorites',
  SETTINGS: 'magic_ball_settings',
  STATS: 'magic_ball_stats',
  ACHIEVEMENTS: 'magic_ball_achievements',
};

export function loadStoredBall(): BallConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_BALL);
    if (!raw) return DEFAULT_BALL;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_BALL, ...parsed, eyes: { ...DEFAULT_BALL.eyes, ...(parsed.eyes || {}) } };
  } catch {
    return DEFAULT_BALL;
  }
}

export function saveStoredBall(ball: BallConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_BALL, JSON.stringify(ball));
  } catch {
    // Local storage quota or unavailable
  }
}

export function loadSavedLooks(): BallConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_LOOKS);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveLook(ball: BallConfig) {
  try {
    const looks = loadSavedLooks();
    const existingIdx = looks.findIndex((b) => b.id === ball.id);
    if (existingIdx >= 0) {
      looks[existingIdx] = ball;
    } else {
      looks.unshift(ball);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_LOOKS, JSON.stringify(looks));
  } catch {
    // ignore
  }
}

export function deleteSavedLook(id: string) {
  try {
    const looks = loadSavedLooks().filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_LOOKS, JSON.stringify(looks));
  } catch {
    // ignore
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return INITIAL_SETTINGS;
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      return {
        coins: 100,
        starsCollected: 0,
        levelsCompleted: 0,
        savedLooksCount: 0,
        colorsTried: ['#3B82F6'],
        customEyeCreated: false,
        highScore: 0,
        unlockedBalls: ['preset-galaxy', 'preset-fire'],
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      coins: 100,
      starsCollected: 0,
      levelsCompleted: 0,
      savedLooksCount: 0,
      colorsTried: ['#3B82F6'],
      customEyeCreated: false,
      highScore: 0,
      unlockedBalls: ['preset-galaxy', 'preset-fire'],
    };
  }
}

export function saveStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (!raw) return INITIAL_ACHIEVEMENTS;
    const stored: Achievement[] = JSON.parse(raw);
    return INITIAL_ACHIEVEMENTS.map((item) => {
      const match = stored.find((s) => s.id === item.id);
      return match ? { ...item, ...match } : item;
    });
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function saveAchievements(items: Achievement[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(items));
  } catch {
    // ignore
  }
}
