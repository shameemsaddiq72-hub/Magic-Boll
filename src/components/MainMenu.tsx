/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Play,
  Palette,
  Gamepad2,
  FolderHeart,
  Gift,
  Trophy,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface MainMenuProps {
  onPlay: () => void;
  onCustomize: () => void;
  onGameModes: () => void;
  onMyBalls: () => void;
  onRewards: () => void;
  onAchievements: () => void;
  onSettings: () => void;
  onHowToPlay: () => void;
  onTapBall: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onCustomize,
  onGameModes,
  onMyBalls,
  onRewards,
  onAchievements,
  onSettings,
  onHowToPlay,
  onTapBall,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 md:p-6 select-none">
      {/* Top Title Banner with protective soft scrim */}
      <div className="text-center pt-8 md:pt-10 pointer-events-auto relative z-10 bg-gradient-to-b from-slate-950/85 via-slate-950/50 to-transparent pb-4 rounded-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-200 text-xs font-semibold tracking-wider uppercase mb-2 shadow">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Interactive 3D Ball Universe</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          MAGIC BALL STUDIO
        </h1>
        <p className="text-xs sm:text-sm md:text-base font-semibold text-amber-100/90 max-w-md mx-auto mt-1 drop-shadow-md">
          “Create Your Ball. Change Your Style. Play Your Adventure.”
        </p>
      </div>

      {/* Center 3D Viewport is 100% clear */}
      <div className="flex-1" />

      {/* Primary & Secondary Action Menu Buttons */}
      <div className="max-w-xl mx-auto w-full pb-3 pointer-events-auto">
        {/* Interaction Hint Pill */}
        <div className="flex justify-center mb-2.5">
          <button
            onClick={() => {
              sound.playSfx('bounce');
              onTapBall();
            }}
            className="group cursor-pointer px-4 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900/90 border border-white/10 hover:border-amber-400/50 text-slate-300 hover:text-white transition shadow text-xs font-medium backdrop-blur-md"
            title="Click to squish & bounce the ball!"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              Drag to rotate &bull; Click or Tap to bounce
            </span>
          </button>
        </div>

        {/* Hero Dual CTA */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => {
              sound.playSfx('click');
              onPlay();
            }}
            className="flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-lg shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer border border-emerald-400/30"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>PLAY</span>
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              onCustomize();
            }}
            className="flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-500 text-white font-bold text-lg shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer border border-pink-400/30"
          >
            <Palette className="w-6 h-6" />
            <span>CUSTOMIZE</span>
          </button>
        </div>

        {/* Secondary Buttons Grid (All 8 functional buttons) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <button
            onClick={() => {
              sound.playSfx('click');
              onGameModes();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 text-slate-200 hover:text-white transition shadow cursor-pointer text-center"
          >
            <Gamepad2 className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[11px] font-semibold leading-tight">MODES</span>
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              onMyBalls();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 text-slate-200 hover:text-white transition shadow cursor-pointer text-center"
          >
            <FolderHeart className="w-4 h-4 text-rose-400 mb-1" />
            <span className="text-[11px] font-semibold leading-tight">MY BALLS</span>
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              onRewards();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 text-slate-200 hover:text-white transition shadow cursor-pointer text-center"
          >
            <Gift className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[11px] font-semibold leading-tight">REWARDS</span>
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              onAchievements();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 text-slate-200 hover:text-white transition shadow cursor-pointer text-center"
          >
            <Trophy className="w-4 h-4 text-yellow-400 mb-1" />
            <span className="text-[11px] font-semibold leading-tight">AWARDS</span>
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              onSettings();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 text-slate-200 hover:text-white transition shadow cursor-pointer text-center"
          >
            <Settings className="w-4 h-4 text-indigo-400 mb-1" />
            <span className="text-[11px] font-semibold leading-tight">SETTINGS</span>
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              onHowToPlay();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 text-slate-200 hover:text-white transition shadow cursor-pointer text-center"
          >
            <HelpCircle className="w-4 h-4 text-teal-400 mb-1" />
            <span className="text-[11px] font-semibold leading-tight">HELP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
