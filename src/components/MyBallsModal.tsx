/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Trash2, Lock, Sparkles, FolderHeart } from 'lucide-react';
import { BallConfig } from '../types/ball';
import { PRESET_BALLS, saveLook, deleteSavedLook } from '../utils/storage';
import { sound } from '../utils/audio';

interface MyBallsModalProps {
  currentBall: BallConfig;
  savedLooks: BallConfig[];
  unlockedBalls: string[];
  coins: number;
  onClose: () => void;
  onLoadBall: (ball: BallConfig) => void;
  onUnlockBall: (presetId: string, cost: number) => void;
  onRefreshLooks: () => void;
}

export const MyBallsModal: React.FC<MyBallsModalProps> = ({
  currentBall,
  savedLooks,
  unlockedBalls,
  coins,
  onClose,
  onLoadBall,
  onUnlockBall,
  onRefreshLooks,
}) => {
  const [tab, setTab] = useState<'presets' | 'saved'>('presets');
  const [saveName, setSaveName] = useState('');

  const PRESET_COSTS: Record<string, number> = {
    'preset-galaxy': 0, // default unlocked
    'preset-fire': 0, // default unlocked
    'preset-ice': 60,
    'preset-rainbow': 80,
    'preset-golden': 120,
    'preset-neon': 70,
    'preset-crystal': 90,
    'preset-robot': 75,
    'preset-candy': 50,
    'preset-shadow': 100,
  };

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;
    const newLook: BallConfig = {
      ...currentBall,
      id: `saved-${Date.now()}`,
      name: saveName.trim(),
    };
    saveLook(newLook);
    setSaveName('');
    onRefreshLooks();
    sound.playSfx('change');
  };

  const handleDelete = (id: string) => {
    deleteSavedLook(id);
    onRefreshLooks();
    sound.playSfx('click');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 md:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-rose-400" />
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">MY BALL COLLECTION</h2>
              <p className="text-xs md:text-sm text-slate-400">Legendary presets & your saved custom styles</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playSfx('click');
              onClose();
            }}
            aria-label="Close My Balls"
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 pt-3">
          <button
            onClick={() => {
              sound.playSfx('click');
              setTab('presets');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
              tab === 'presets' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Legendary Presets ({PRESET_BALLS.length})
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              setTab('saved');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
              tab === 'saved' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Custom Saved Looks ({savedLooks.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto py-4 flex-1">
          {tab === 'presets' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_BALLS.map((preset) => {
                const isUnlocked = unlockedBalls.includes(preset.id);
                const cost = PRESET_COSTS[preset.id] || 0;
                const canAfford = coins >= cost;
                const isCurrent = currentBall.name === preset.name;

                return (
                  <div
                    key={preset.id}
                    className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3 shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white/20 shadow-md flex items-center justify-center text-sm"
                        style={{ backgroundColor: preset.color }}
                      >
                        {preset.accessory === 'crown' && '👑'}
                        {preset.accessory === 'hat' && '🎩'}
                        {preset.accessory === 'sunglasses' && '🕶️'}
                        {preset.accessory === 'headphones' && '🎧'}
                        {preset.accessory === 'bow' && '🎀'}
                        {preset.accessory === 'wings' && '🪽'}
                        {preset.accessory === 'horns' && '😈'}
                        {preset.accessory === 'stars' && '⭐'}
                        {preset.accessory === 'flower' && '🌸'}
                        {preset.accessory === 'mask' && '🎭'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{preset.name}</h4>
                        <span className="text-[11px] text-slate-400 capitalize">
                          {preset.material} &bull; {preset.pattern}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isUnlocked ? (
                        <button
                          onClick={() => {
                            sound.playSfx('change');
                            onLoadBall(preset);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                          }`}
                        >
                          {isCurrent ? 'Equipped' : 'Equip'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (canAfford) {
                              onUnlockBall(preset.id, cost);
                              sound.playSfx('star');
                            }
                          }}
                          disabled={!canAfford}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{cost} coins</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Save current form */}
              <form onSubmit={handleSaveCurrent} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Name your current style..."
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs md:text-sm focus:outline-none focus:border-indigo-500"
                  maxLength={25}
                />
                <button
                  type="submit"
                  disabled={!saveName.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs md:text-sm shadow cursor-pointer transition"
                >
                  Save Look
                </button>
              </form>

              {/* Saved list */}
              {savedLooks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No saved styles yet. Customize your ball and click Save!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedLooks.map((look) => (
                    <div
                      key={look.id}
                      className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3 shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full border border-white/20 shadow-md"
                          style={{ backgroundColor: look.color }}
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">{look.name}</h4>
                          <span className="text-[11px] text-slate-400 capitalize">
                            {look.material} &bull; {look.eyes.expression}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            sound.playSfx('change');
                            onLoadBall(look);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow cursor-pointer transition"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDelete(look.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-700 cursor-pointer transition"
                          title="Delete look"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
