/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Pause, RotateCcw, Star, Coins, ArrowUp, ArrowLeft, ArrowDown, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameHUDProps {
  levelName: string;
  score: number;
  coins: number;
  starsCollected: number;
  totalStars: number;
  targetColor?: string;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
  onVirtualInput: (x: number, z: number, jump: boolean) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  levelName,
  score,
  coins,
  starsCollected,
  totalStars,
  targetColor,
  isPaused,
  onPause,
  onResume,
  onRestart,
  onQuitToMenu,
  onVirtualInput,
}) => {
  const [elapsed, setElapsed] = useState(0);

  // Timer loop
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Virtual control states for mobile
  const [activeDirs, setActiveDirs] = useState<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const updateVirtual = (dirs: { up: boolean; down: boolean; left: boolean; right: boolean }, jump = false) => {
    let x = 0;
    let z = 0;
    if (dirs.left) x -= 1;
    if (dirs.right) x += 1;
    if (dirs.up) z -= 1;
    if (dirs.down) z += 1;
    onVirtualInput(x, z, jump);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 md:p-5 z-20">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Level Badge */}
          <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/80 shadow text-xs md:text-sm font-bold text-white">
            {levelName}
          </div>

          {/* Target Color (Color Catcher mode) */}
          {targetColor && (
            <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow text-xs font-semibold text-white">
              <span>Target:</span>
              <div
                className="w-4 h-4 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: targetColor }}
              />
            </div>
          )}
        </div>

        {/* Stats (Score, Stars, Coins, Timer) */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-amber-500/30 text-amber-300 font-bold text-xs md:text-sm shadow">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{coins}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-yellow-500/30 text-yellow-300 font-bold text-xs md:text-sm shadow">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>
              {starsCollected}/{totalStars}
            </span>
          </div>

          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 text-white font-mono text-xs md:text-sm shadow">
            {formatTime(elapsed)}
          </div>

          {/* Action buttons */}
          <button
            onClick={() => {
              sound.playSfx('click');
              onRestart();
              setElapsed(0);
            }}
            className="p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition shadow cursor-pointer"
            title="Restart Level (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              onPause();
            }}
            className="p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition shadow cursor-pointer"
            title="Pause Game (ESC)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Desktop Control Hint (fades out gently or stays clean) */}
      <div className="hidden md:flex justify-center pointer-events-none">
        <div className="bg-slate-900/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 text-slate-300 text-xs">
          Use <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-semibold text-white">WASD</kbd> or{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-semibold text-white">Arrows</kbd> to move &bull;{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-semibold text-white">Space</kbd> to jump &bull;{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-semibold text-white">R</kbd> restart
        </div>
      </div>

      {/* Bottom Mobile Controls (Touch D-pad & Jump Button) */}
      <div className="flex md:hidden items-end justify-between w-full pointer-events-auto pb-3 px-1">
        {/* D-Pad */}
        <div className="relative w-36 h-36 bg-slate-900/60 rounded-full border border-white/15 backdrop-blur-md p-1 shadow-lg flex items-center justify-center">
          {/* UP */}
          <button
            onPointerDown={() => {
              const next = { ...activeDirs, up: true };
              setActiveDirs(next);
              updateVirtual(next);
            }}
            onPointerUp={() => {
              const next = { ...activeDirs, up: false };
              setActiveDirs(next);
              updateVirtual(next);
            }}
            className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-800/80 active:bg-indigo-600 flex items-center justify-center text-white"
          >
            <ArrowUp className="w-5 h-5" />
          </button>

          {/* DOWN */}
          <button
            onPointerDown={() => {
              const next = { ...activeDirs, down: true };
              setActiveDirs(next);
              updateVirtual(next);
            }}
            onPointerUp={() => {
              const next = { ...activeDirs, down: false };
              setActiveDirs(next);
              updateVirtual(next);
            }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-800/80 active:bg-indigo-600 flex items-center justify-center text-white"
          >
            <ArrowDown className="w-5 h-5" />
          </button>

          {/* LEFT */}
          <button
            onPointerDown={() => {
              const next = { ...activeDirs, left: true };
              setActiveDirs(next);
              updateVirtual(next);
            }}
            onPointerUp={() => {
              const next = { ...activeDirs, left: false };
              setActiveDirs(next);
              updateVirtual(next);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 active:bg-indigo-600 flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* RIGHT */}
          <button
            onPointerDown={() => {
              const next = { ...activeDirs, right: true };
              setActiveDirs(next);
              updateVirtual(next);
            }}
            onPointerUp={() => {
              const next = { ...activeDirs, right: false };
              setActiveDirs(next);
              updateVirtual(next);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 active:bg-indigo-600 flex items-center justify-center text-white"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* JUMP BUTTON */}
        <button
          onPointerDown={() => {
            updateVirtual(activeDirs, true);
          }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500 active:scale-95 shadow-xl border-2 border-white/30 flex items-center justify-center text-white font-bold text-sm"
        >
          JUMP
        </button>
      </div>

      {/* Pause Modal */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-2">GAME PAUSED</h2>
            <p className="text-sm text-slate-400 mb-6">Take a breather or adjust settings.</p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  sound.playSfx('click');
                  onResume();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg hover:brightness-110 cursor-pointer"
              >
                RESUME
              </button>

              <button
                onClick={() => {
                  sound.playSfx('click');
                  onRestart();
                  setElapsed(0);
                }}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer border border-slate-700"
              >
                RESTART LEVEL
              </button>

              <button
                onClick={() => {
                  sound.playSfx('click');
                  onQuitToMenu();
                }}
                className="w-full py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold cursor-pointer border border-red-500/30"
              >
                EXIT TO MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
