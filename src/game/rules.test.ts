/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScore,
  checkWinCondition,
  calculateStarRating,
  checkCustomizationMatch,
  checkSphereBoxCollision,
  updateAchievementsProgress,
  CustomizationTarget,
} from './rules';
import { DEFAULT_BALL } from '../utils/storage';
import { PlayerStats, Achievement } from '../types/ball';

test('scoring logic calculates score with difficulty scaling and time bonus', () => {
  const normalScore = calculateScore(5, 10, 30, 'normal');
  // base = 5 * 100 + 10 * 20 = 700. Time bonus = 30 * 10 = 300. Total = 1000 * 1.0 = 1000
  assert.equal(normalScore, 1000);

  const hardScore = calculateScore(5, 10, 30, 'hard');
  // 1000 * 1.5 = 1500
  assert.equal(hardScore, 1500);

  const easyScore = calculateScore(5, 10, 30, 'easy');
  // 1000 * 0.8 = 800
  assert.equal(easyScore, 800);
});

test('win condition checks collected stars against target', () => {
  assert.equal(checkWinCondition(3, 3), true);
  assert.equal(checkWinCondition(4, 3), true);
  assert.equal(checkWinCondition(2, 3), false);
});

test('star rating evaluates 1, 2, or 3 stars based on collection and speed', () => {
  assert.equal(calculateStarRating(2, 3, 20, 30), 1); // missed stars
  assert.equal(calculateStarRating(3, 3, 25, 30), 3); // all stars under par time
  assert.equal(calculateStarRating(3, 3, 40, 30), 2); // all stars over par time
});

test('sphere-box collision detects overlap and computes collision normal', () => {
  const box = { minX: -2, maxX: 2, minY: 0, maxY: 1, minZ: -2, maxZ: 2 };

  // Ball resting just above top face at y = 1.3 (radius 0.5 -> overlaps into y=1.0 by 0.2)
  const hit = checkSphereBoxCollision(0, 1.3, 0, 0.5, box);
  assert.equal(hit.collided, true);
  assert.ok(hit.normalY > 0.9);
  assert.ok(hit.depth > 0.15);

  // Ball far away
  const miss = checkSphereBoxCollision(10, 10, 10, 0.5, box);
  assert.equal(miss.collided, false);
});

test('customization match validates targets accurately', () => {
  const target: CustomizationTarget = {
    name: 'Cosmic Prince',
    description: 'Purple ball with gold accessories',
    expectedColor: '#8B5CF6',
    expectedMaterial: 'crystal',
  };

  const ball = {
    ...DEFAULT_BALL,
    color: '#8B5CF6',
    material: 'crystal' as const,
  };

  const match = checkCustomizationMatch(ball, target);
  assert.equal(match.passed, true);
  assert.equal(match.score, match.maxScore);

  // Mismatched ball
  const badMatch = checkCustomizationMatch(DEFAULT_BALL, target);
  assert.equal(badMatch.passed, false);
  assert.ok(badMatch.score < badMatch.maxScore);
});

test('achievements progress reflects updated player stats', () => {
  const stats: PlayerStats = {
    coins: 50,
    starsCollected: 120,
    levelsCompleted: 3,
    savedLooksCount: 3,
    colorsTried: ['#111', '#222', '#333', '#444', '#555'],
    customEyeCreated: true,
    highScore: 500,
    unlockedBalls: [],
  };

  const dummyAchievements: Achievement[] = [
    { id: 'first-level', title: 'First', description: '', rewardCoins: 10, progress: 0, maxProgress: 1, completed: false, claimed: false, icon: '' },
    { id: 'stars-100', title: 'Stars', description: '', rewardCoins: 10, progress: 0, maxProgress: 100, completed: false, claimed: false, icon: '' },
    { id: 'colors-5', title: 'Colors', description: '', rewardCoins: 10, progress: 0, maxProgress: 5, completed: false, claimed: false, icon: '' },
    { id: 'custom-eye', title: 'Eye', description: '', rewardCoins: 10, progress: 0, maxProgress: 1, completed: false, claimed: false, icon: '' },
    { id: 'save-3', title: 'Save', description: '', rewardCoins: 10, progress: 0, maxProgress: 3, completed: false, claimed: false, icon: '' },
  ];

  const updated = updateAchievementsProgress(stats, dummyAchievements);
  assert.ok(updated.every((ach) => ach.completed));
});
