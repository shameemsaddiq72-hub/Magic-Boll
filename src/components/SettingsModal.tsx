/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Volume2, VolumeX, Monitor, Sliders, Shield, RotateCcw } from 'lucide-react';
import { GameSettings, DifficultyLevel } from '../types/ball';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetSettings: () => void;
  onOpenHowToPlay: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onClose,
  onUpdateSettings,
  onResetSettings,
  onOpenHowToPlay,
}) => {
  const [tab, setTab] = useState<'audio' | 'graphics' | 'controls' | 'gameplay'>('audio');

  const update = (partial: Partial<GameSettings>) => {
    const updated = { ...settings, ...partial };
    onUpdateSettings(updated);
    sound.setVolumes(updated.masterVolume, updated.musicVolume, updated.sfxVolume, updated.muted);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-5 md:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">GAME SETTINGS</h2>
            <p className="text-xs md:text-sm text-slate-400">Configure sound, visuals, difficulty & controls</p>
          </div>
          <button
            onClick={() => {
              sound.playSfx('click');
              onClose();
            }}
            aria-label="Close Settings"
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 pt-3 pb-1 border-b border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => {
              sound.playSfx('click');
              setTab('audio');
            }}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              tab === 'audio' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => {
              sound.playSfx('click');
              setTab('graphics');
            }}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              tab === 'graphics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Graphics
          </button>
          <button
            onClick={() => {
              sound.playSfx('click');
              setTab('controls');
            }}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              tab === 'controls' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Controls
          </button>
          <button
            onClick={() => {
              sound.playSfx('click');
              setTab('gameplay');
            }}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              tab === 'gameplay' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gameplay
          </button>
        </div>

        {/* Tab panels */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1">
          {tab === 'audio' && (
            <div className="space-y-4 text-xs md:text-sm">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center gap-2 text-white font-bold">
                  {settings.muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
                  <span>Mute All Audio</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.muted}
                  onChange={(e) => update({ muted: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Master Volume</span>
                  <span>{Math.round(settings.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => update({ masterVolume: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Music Volume</span>
                  <span>{Math.round(settings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => update({ musicVolume: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Sound Effects (SFX)</span>
                  <span>{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => update({ sfxVolume: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {tab === 'graphics' && (
            <div className="space-y-4 text-xs md:text-sm">
              <div>
                <span className="text-slate-400 font-semibold block mb-2">Graphics Quality</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => update({ graphicsQuality: q })}
                      className={`py-2 rounded-xl text-xs font-bold capitalize cursor-pointer transition ${
                        settings.graphicsQuality === q
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer">
                  <span className="text-white font-medium">Real-time Shadows</span>
                  <input
                    type="checkbox"
                    checked={settings.shadows}
                    onChange={(e) => update({ shadows: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer">
                  <span className="text-white font-medium">Post-processing Glow</span>
                  <input
                    type="checkbox"
                    checked={settings.glow}
                    onChange={(e) => update({ glow: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer">
                  <span className="text-white font-medium">Reduced Motion</span>
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={(e) => update({ reducedMotion: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-500"
                  />
                </label>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Particle Intensity</span>
                  <span>{settings.particleIntensity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.1"
                  value={settings.particleIntensity}
                  onChange={(e) => update({ particleIntensity: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {tab === 'controls' && (
            <div className="space-y-4 text-xs md:text-sm">
              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Mouse Sensitivity</span>
                  <span>{settings.mouseSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.mouseSensitivity}
                  onChange={(e) => update({ mouseSensitivity: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Touch Drag Sensitivity</span>
                  <span>{settings.touchSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.touchSensitivity}
                  onChange={(e) => update({ touchSensitivity: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold">How to Play & Controls Guide</h4>
                  <p className="text-xs text-indigo-200">View complete desktop & mobile keys</p>
                </div>
                <button
                  onClick={() => {
                    sound.playSfx('click');
                    onOpenHowToPlay();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow hover:bg-indigo-500 cursor-pointer"
                >
                  View Guide
                </button>
              </div>
            </div>
          )}

          {tab === 'gameplay' && (
            <div className="space-y-4 text-xs md:text-sm">
              <div>
                <span className="text-slate-400 font-semibold block mb-2">Gameplay Difficulty</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'normal', 'hard'] as DifficultyLevel[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => update({ difficulty: d })}
                      className={`py-2 rounded-xl text-xs font-bold capitalize cursor-pointer transition ${
                        settings.difficulty === d
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 cursor-pointer">
                <span className="text-white font-medium">In-Game Control Hints</span>
                <input
                  type="checkbox"
                  checked={settings.controlHints}
                  onChange={(e) => update({ controlHints: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-500"
                />
              </label>

              <button
                onClick={() => {
                  sound.playSfx('change');
                  onResetSettings();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory Defaults</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
