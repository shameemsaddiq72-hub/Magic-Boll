/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BallMaterialType =
  | 'glossy'
  | 'rubber'
  | 'chrome'
  | 'gold'
  | 'silver'
  | 'glass'
  | 'crystal'
  | 'neon'
  | 'jelly'
  | 'holographic'
  | 'ice'
  | 'lava'
  | 'galaxy';

export type PatternType =
  | 'none'
  | 'stripes'
  | 'dots'
  | 'stars'
  | 'hearts'
  | 'lightning'
  | 'flames'
  | 'clouds'
  | 'spirals'
  | 'checkerboard'
  | 'geometric'
  | 'galaxy';

export type EyeShapeType =
  | 'cute-round'
  | 'large-cartoon'
  | 'anime'
  | 'robot'
  | 'neon'
  | 'star'
  | 'heart'
  | 'spiral'
  | 'sleepy'
  | 'angry'
  | 'surprised';

export type ExpressionType =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'excited'
  | 'sleepy'
  | 'surprised'
  | 'confused'
  | 'laughing'
  | 'wink'
  | 'love-struck';

export type AccessoryType =
  | 'none'
  | 'crown'
  | 'hat'
  | 'sunglasses'
  | 'headphones'
  | 'bow'
  | 'wings'
  | 'horns'
  | 'stars'
  | 'flower'
  | 'mask';

export type EffectType =
  | 'none'
  | 'neon-glow'
  | 'fire-trail'
  | 'ice-trail'
  | 'rainbow-trail'
  | 'sparkles'
  | 'stars'
  | 'lightning'
  | 'magical-aura';

export type BallShapeType = 'sphere' | 'squishy' | 'jelly' | 'puffy';

export interface EyeConfig {
  lockTogether: boolean;
  leftColor: string;
  rightColor: string;
  shape: EyeShapeType;
  expression: ExpressionType;
  size: number; // 0.6 to 1.4
  spacing: number; // 0.6 to 1.4
  pupilSize: number; // 0.4 to 1.3
  pupilDirX: number; // -1 to 1
  pupilDirY: number; // -1 to 1
  shine: boolean;
}

export interface BallConfig {
  id: string;
  name: string;
  color: string;
  gradient: string; // 'none' | preset name
  material: BallMaterialType;
  pattern: PatternType;
  patternColor: string;
  patternScale: number; // 1 to 8
  shape: BallShapeType;
  size: number; // 0.7 to 1.3
  eyes: EyeConfig;
  accessory: AccessoryType;
  accessoryColor: string;
  effect: EffectType;
  effectIntensity: number; // 0.2 to 1.5
  isFavorite?: boolean;
}

export type GameModeType =
  | 'arcade'
  | 'freeplay'
  | 'color-catcher'
  | 'obstacle-escape'
  | 'ball-challenge'
  | 'customization-challenge'
  | 'relax';

export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  shadows: boolean;
  glow: boolean;
  particleIntensity: number;
  reducedMotion: boolean;
  mouseSensitivity: number;
  touchSensitivity: number;
  difficulty: DifficultyLevel;
  controlHints: boolean;
}

export interface PlayerStats {
  coins: number;
  starsCollected: number;
  levelsCompleted: number;
  savedLooksCount: number;
  colorsTried: string[];
  customEyeCreated: boolean;
  highScore: number;
  unlockedBalls: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}
