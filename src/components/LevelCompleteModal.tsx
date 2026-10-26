/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Trophy, Star, Coins, RotateCcw, ArrowRight, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface LevelCompleteModalProps {
  levelIdx: number;
  score: number;
  coinsEarned: number;
  starsCollected: number;
  totalStars: number;
  timeUsedSec: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onQuitToMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelIdx,
  score,
  coinsEarned,
  starsCollected,
  totalStars,
  timeUsedSec,
  onNextLevel,
  onReplay,
  onQuitToMenu,
}) => {
  useEffect(() => {
    sound.playSfx('win');
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  }, []);

  const starRating = starsCollected >= totalStars && timeUsedSec <= 30 ? 3 : starsCollected >= totalStars ? 2 : 1;

  const isFinalLevel = levelIdx >= 4;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-3 shadow-inner">
          <Trophy className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-black text-white">LEVEL COMPLETE!</h2>
        <p className="text-xs text-slate-400 mt-0.5">Stage {levelIdx + 1} Cleared</p>

        {/* 3 Stars */}
        <div className="flex items-center justify-center gap-3 my-4">
          {[1, 2, 3].map((starNum) => {
            const earned = starNum <= starRating;
            return (
              <div
                key={starNum}
                className={`transition-transform duration-300 ${
                  earned ? 'scale-110 text-yellow-400' : 'text-slate-700 scale-90'
                }`}
              >
                <Star className={`w-8 h-8 ${earned ? 'fill-yellow-400 drop-shadow-md' : ''}`} />
              </div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 my-4 text-xs font-semibold">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-slate-400 block mb-0.5">Final Score</span>
            <span className="text-base font-bold text-white font-mono">{score}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-slate-400 block mb-0.5">Coins Earned</span>
            <div className="flex items-center justify-center gap-1 text-base font-bold text-amber-300 font-mono">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>+{coinsEarned}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5 mt-5">
          {!isFinalLevel ? (
            <button
              onClick={() => {
                sound.playSfx('click');
                onNextLevel();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playSfx('click');
                onQuitToMenu();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONQUERED ALL LEVELS!</span>
              <Trophy className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playSfx('click');
                onReplay();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            <button
              onClick={() => {
                sound.playSfx('click');
                onQuitToMenu();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
