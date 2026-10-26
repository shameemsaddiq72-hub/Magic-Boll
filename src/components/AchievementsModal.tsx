/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trophy, Coins, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Achievement } from '../types/ball';
import { sound } from '../utils/audio';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClose: () => void;
  onClaimAchievement: (id: string, coins: number) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClose,
  onClaimAchievement,
}) => {
  const completedCount = achievements.filter((a) => a.completed).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-5 md:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">ACHIEVEMENTS</h2>
              <p className="text-xs md:text-sm text-slate-400">
                Unlocked {completedCount} of {achievements.length} achievements
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playSfx('click');
              onClose();
            }}
            aria-label="Close Achievements"
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-3 flex-1 pr-1">
          {achievements.map((ach) => {
            const pct = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition shadow ${
                  ach.completed
                    ? 'bg-slate-800/90 border-yellow-500/30'
                    : 'bg-slate-800/50 border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ach.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                      <p className="text-xs text-slate-400">{ach.description}</p>
                    </div>
                  </div>

                  <div>
                    {ach.claimed ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" />
                        Claimed
                      </span>
                    ) : ach.completed ? (
                      <button
                        onClick={() => {
                          onClaimAchievement(ach.id, ach.rewardCoins);
                          sound.playSfx('win');
                          confetti({ particleCount: 70, spread: 70 });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow cursor-pointer transition animate-pulse"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>+{ach.rewardCoins}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-amber-300/70 font-semibold">
                        <Coins className="w-3.5 h-3.5" />
                        <span>+{ach.rewardCoins}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/60">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ach.completed ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>Progress</span>
                  <span>
                    {ach.progress}/{ach.maxProgress} ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
