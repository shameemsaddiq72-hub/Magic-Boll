/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Palette, CheckCircle2, AlertCircle, Coins, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BallConfig } from '../types/ball';
import { checkCustomizationMatch, CustomizationTarget } from '../game/rules';
import { sound } from '../utils/audio';

interface CustomizationChallengeModalProps {
  currentBall: BallConfig;
  onClose: () => void;
  onOpenStudio: () => void;
  onAddCoins: (amount: number) => void;
}

const CHALLENGES: CustomizationTarget[] = [
  {
    name: 'Galactic Prince',
    description: 'Design a regal cosmic ball with purple body, gold eyes, galaxy pattern, and royal crown.',
    expectedColor: '#8B5CF6',
    expectedLeftEyeColor: '#FBBF24',
    expectedRightEyeColor: '#FBBF24',
    expectedPattern: 'galaxy',
    expectedAccessory: 'crown',
  },
  {
    name: 'Inferno Dragon',
    description: 'Craft a fierce magma beast with red body, fire patterns, and demon horns.',
    expectedColor: '#EF4444',
    expectedLeftEyeColor: '#EF4444',
    expectedRightEyeColor: '#EF4444',
    expectedPattern: 'flames',
    expectedAccessory: 'horns',
  },
  {
    name: 'Cyberpunk Android',
    description: 'Construct a futuristic cyborg with silver chrome body, cyan neon eyes, and headphones.',
    expectedColor: '#94A3B8',
    expectedLeftEyeColor: '#06B6D4',
    expectedRightEyeColor: '#06B6D4',
    expectedMaterial: 'chrome',
    expectedAccessory: 'headphones',
  },
];

export const CustomizationChallengeModal: React.FC<CustomizationChallengeModalProps> = ({
  currentBall,
  onClose,
  onOpenStudio,
  onAddCoins,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [result, setResult] = useState<{ score: number; maxScore: number; passed: boolean; feedback: string[] } | null>(null);
  const [claimed, setClaimed] = useState<number[]>([]);

  const activeChallenge = CHALLENGES[selectedIdx];

  const handleValidate = () => {
    const res = checkCustomizationMatch(currentBall, activeChallenge);
    setResult(res);

    if (res.passed) {
      if (!claimed.includes(selectedIdx)) {
        setClaimed((prev) => [...prev, selectedIdx]);
        onAddCoins(100);
        sound.playSfx('win');
        confetti({ particleCount: 90, spread: 80 });
      } else {
        sound.playSfx('change');
      }
    } else {
      sound.playSfx('hit');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-5 md:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-yellow-400" />
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">CUSTOMIZATION CHALLENGE</h2>
              <p className="text-xs md:text-sm text-slate-400">Match the target aesthetic to earn coin bounties</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playSfx('click');
              onClose();
            }}
            aria-label="Close Customization Challenge"
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenge selection pills */}
        <div className="flex gap-2 pt-3 overflow-x-auto pb-1">
          {CHALLENGES.map((c, idx) => (
            <button
              key={c.name}
              onClick={() => {
                sound.playSfx('click');
                setSelectedIdx(idx);
                setResult(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                selectedIdx === idx ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c.name} {claimed.includes(idx) && '✓'}
            </button>
          ))}
        </div>

        {/* Challenge Details Card */}
        <div className="py-4 space-y-4 flex-1 overflow-y-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 to-purple-950/40 border border-indigo-500/40 shadow">
            <h3 className="text-base font-bold text-white mb-1">{activeChallenge.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">{activeChallenge.description}</p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {activeChallenge.expectedColor && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div
                    className="w-4 h-4 rounded-full border border-white"
                    style={{ backgroundColor: activeChallenge.expectedColor }}
                  />
                  <span className="text-slate-300 font-medium">Ball Color</span>
                </div>
              )}

              {activeChallenge.expectedLeftEyeColor && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div
                    className="w-4 h-4 rounded-full border border-white"
                    style={{ backgroundColor: activeChallenge.expectedLeftEyeColor }}
                  />
                  <span className="text-slate-300 font-medium">Eye Color</span>
                </div>
              )}

              {activeChallenge.expectedPattern && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span className="text-slate-300 font-medium capitalize">{activeChallenge.expectedPattern} pattern</span>
                </div>
              )}

              {activeChallenge.expectedAccessory && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300 font-medium capitalize">{activeChallenge.expectedAccessory} accessory</span>
                </div>
              )}
            </div>
          </div>

          {/* Validation Result */}
          {result && (
            <div
              className={`p-4 rounded-2xl border shadow ${
                result.passed
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                  : 'bg-amber-950/50 border-amber-500/50 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">
                  {result.passed ? 'PERFECT MATCH! (100%)' : `Match Score: ${result.score}/${result.maxScore}`}
                </span>
                {result.passed && !claimed.includes(selectedIdx) && (
                  <span className="flex items-center gap-1 font-bold text-amber-300 text-xs">
                    <Coins className="w-4 h-4" /> +100 Bonus Coins!
                  </span>
                )}
              </div>
              <ul className="space-y-1 text-xs">
                {result.feedback.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    {result.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              sound.playSfx('click');
              onClose();
              onOpenStudio();
            }}
            className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs md:text-sm cursor-pointer border border-slate-700"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleValidate}
            className="py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs md:text-sm shadow cursor-pointer transition"
          >
            Check Match
          </button>
        </div>
      </div>
    </div>
  );
};
