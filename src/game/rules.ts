/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BallConfig, DifficultyLevel, PlayerStats, Achievement } from '../types/ball';

export interface BoxBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export function calculateScore(
  stars: number,
  coins: number,
  timeRemainingSec: number,
  difficulty: DifficultyLevel
): number {
  const diffMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'normal' ? 1.0 : 0.8;
  const baseScore = stars * 100 + coins * 20;
  const timeBonus = Math.max(0, Math.floor(timeRemainingSec * 10));
  return Math.round((baseScore + timeBonus) * diffMultiplier);
}

export function checkWinCondition(collectedStars: number, requiredStars: number): boolean {
  return collectedStars >= requiredStars;
}

export function calculateStarRating(collectedStars: number, totalStars: number, timeUsedSec: number, parTimeSec: number): 1 | 2 | 3 {
  if (collectedStars < totalStars) {
    return 1;
  }
  if (timeUsedSec <= parTimeSec) {
    return 3;
  }
  return 2;
}

export interface CustomizationTarget {
  name: string;
  description: string;
  expectedColor?: string;
  expectedLeftEyeColor?: string;
  expectedRightEyeColor?: string;
  expectedMaterial?: string;
  expectedPattern?: string;
  expectedAccessory?: string;
}

export function checkCustomizationMatch(
  current: BallConfig,
  target: CustomizationTarget
): { score: number; maxScore: number; passed: boolean; feedback: string[] } {
  let score = 0;
  let maxScore = 0;
  const feedback: string[] = [];

  if (target.expectedColor) {
    maxScore += 20;
    if (current.color.toLowerCase() === target.expectedColor.toLowerCase()) {
      score += 20;
      feedback.push('Correct ball color!');
    } else {
      feedback.push('Ball color does not match target.');
    }
  }

  if (target.expectedLeftEyeColor) {
    maxScore += 15;
    if (current.eyes.leftColor.toLowerCase() === target.expectedLeftEyeColor.toLowerCase()) {
      score += 15;
      feedback.push('Correct left eye color!');
    } else {
      feedback.push('Left eye color mismatch.');
    }
  }

  if (target.expectedRightEyeColor) {
    maxScore += 15;
    if (current.eyes.rightColor.toLowerCase() === target.expectedRightEyeColor.toLowerCase()) {
      score += 15;
      feedback.push('Correct right eye color!');
    } else {
      feedback.push('Right eye color mismatch.');
    }
  }

  if (target.expectedMaterial) {
    maxScore += 20;
    if (current.material === target.expectedMaterial) {
      score += 20;
      feedback.push('Correct material applied!');
    } else {
      feedback.push(`Needs ${target.expectedMaterial} material.`);
    }
  }

  if (target.expectedPattern) {
    maxScore += 15;
    if (current.pattern === target.expectedPattern) {
      score += 15;
      feedback.push('Pattern matches!');
    } else {
      feedback.push(`Needs ${target.expectedPattern} pattern.`);
    }
  }

  if (target.expectedAccessory) {
    maxScore += 15;
    if (current.accessory === target.expectedAccessory) {
      score += 15;
      feedback.push('Accessory equipped correctly!');
    } else {
      feedback.push(`Equip ${target.expectedAccessory}.`);
    }
  }

  const passed = maxScore > 0 && score === maxScore;
  return { score, maxScore, passed, feedback };
}

export function checkSphereBoxCollision(
  ballX: number,
  ballY: number,
  ballZ: number,
  ballRadius: number,
  box: BoxBounds
): { collided: boolean; normalX: number; normalY: number; normalZ: number; depth: number } {
  // Clamping point on box closest to sphere center
  const closestX = Math.max(box.minX, Math.min(ballX, box.maxX));
  const closestY = Math.max(box.minY, Math.min(ballY, box.maxY));
  const closestZ = Math.max(box.minZ, Math.min(ballZ, box.maxZ));

  const dx = ballX - closestX;
  const dy = ballY - closestY;
  const dz = ballZ - closestZ;

  const distanceSquared = dx * dx + dy * dy + dz * dz;

  if (distanceSquared <= ballRadius * ballRadius) {
    const distance = Math.sqrt(distanceSquared) || 0.001;
    const depth = ballRadius - distance;
    return {
      collided: true,
      normalX: dx / distance,
      normalY: dy / distance,
      normalZ: dz / distance,
      depth,
    };
  }

  return { collided: false, normalX: 0, normalY: 0, normalZ: 0, depth: 0 };
}

export function updateAchievementsProgress(stats: PlayerStats, achievements: Achievement[]): Achievement[] {
  return achievements.map((ach) => {
    let progress = ach.progress;
    if (ach.id === 'first-level') {
      progress = stats.levelsCompleted >= 1 ? 1 : 0;
    } else if (ach.id === 'stars-100') {
      progress = Math.min(100, stats.starsCollected);
    } else if (ach.id === 'colors-5') {
      progress = Math.min(5, stats.colorsTried.length);
    } else if (ach.id === 'custom-eye') {
      progress = stats.customEyeCreated ? 1 : 0;
    } else if (ach.id === 'save-3') {
      progress = Math.min(3, stats.savedLooksCount);
    } else if (ach.id === 'levels-5') {
      progress = Math.min(5, stats.levelsCompleted);
    }

    const completed = progress >= ach.maxProgress;
    return { ...ach, progress, completed };
  });
}
