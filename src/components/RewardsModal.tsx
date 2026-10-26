/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Gift, Star, Coins, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface RewardsModalProps {
  coins: number;
  starsCollected: number;
  onClose: () => void;
  onAddCoins: (amount: number) => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  coins,
  starsCollected,
  onClose,
  onAddCoins,
}) => {
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);

  const milestones = [
    { target: 5, reward: 40, label: 'Star Apprentice' },
    { target: 15, reward: 80, label: 'Orb Voyager' },
    { target: 30, reward: 150, label: 'Cosmic Hopper' },
    { target: 60, reward: 300, label: 'Star Master' },
  ];

  const handleClaimDaily = () => {
    if (dailyClaimed) return;
    setDailyClaimed(true);
    onAddCoins(60);
    sound.playSfx('win');
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  const handleClaimMilestone = (target: number, reward: number) => {
    if (claimedMilestones.includes(target) || starsCollected < target) return;
    setClaimedMilestones((prev) => [...prev, target]);
    onAddCoins(reward);
    sound.playSfx('win');
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 md:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">REWARDS & CHESTS</h2>
              <p className="text-xs md:text-sm text-slate-400">Claim free daily coins and star milestones</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playSfx('click');
              onClose();
            }}
            aria-label="Close Rewards"
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4">
          {/* Daily Reward Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-yellow-950/40 border border-amber-500/40 flex items-center justify-between shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Daily Studio Gift</h4>
                <div className="flex items-center gap-1 text-xs text-amber-300 font-semibold mt-0.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>+60 Free Coins</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClaimDaily}
              disabled={dailyClaimed}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow cursor-pointer ${
                dailyClaimed
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {dailyClaimed ? 'Claimed' : 'Claim Now'}
            </button>
          </div>

          {/* Star Milestones */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Star Milestones ({starsCollected} stars collected)
              </h3>
            </div>

            <div className="space-y-2.5">
              {milestones.map((m) => {
                const isClaimed = claimedMilestones.includes(m.target);
                const canClaim = starsCollected >= m.target && !isClaimed;

                return (
                  <div
                    key={m.target}
                    className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3 shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
                        <Star className="w-5 h-5 fill-yellow-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{m.label}</h4>
                        <span className="text-[11px] text-slate-400">
                          Collect {m.target} stars &bull; Reward: {m.reward} coins
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleClaimMilestone(m.target, m.reward)}
                      disabled={!canClaim}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow cursor-pointer ${
                        isClaimed
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canClaim
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                          : 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {isClaimed ? 'Claimed' : canClaim ? 'Claim!' : `${starsCollected}/${m.target}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
