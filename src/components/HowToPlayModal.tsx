/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Keyboard, Smartphone, Sparkles, Trophy, Palette } from 'lucide-react';
import { sound } from '../utils/audio';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-5 md:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">HOW TO PLAY</h2>
            <p className="text-xs md:text-sm text-slate-400">Controls, customization tips, and game objectives</p>
          </div>
          <button
            onClick={() => {
              sound.playSfx('click');
              onClose();
            }}
            aria-label="Close How to Play"
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 text-xs md:text-sm text-slate-300">
          {/* Desktop Controls */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center gap-2 text-white font-bold mb-2">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>Desktop Keyboard & Mouse Controls</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">WASD / Arrows</span>
                <span className="ml-1.5 text-slate-300">Roll & Move Ball</span>
              </div>
              <div>
                <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">Spacebar</span>
                <span className="ml-1.5 text-slate-300">Jump / Hop</span>
              </div>
              <div>
                <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">R</span>
                <span className="ml-1.5 text-slate-300">Restart Level</span>
              </div>
              <div>
                <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">ESC</span>
                <span className="ml-1.5 text-slate-300">Pause Game</span>
              </div>
              <div>
                <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">M</span>
                <span className="ml-1.5 text-slate-300">Toggle Music</span>
              </div>
              <div>
                <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">Mouse Drag</span>
                <span className="ml-1.5 text-slate-300">Rotate & Zoom Ball</span>
              </div>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center gap-2 text-white font-bold mb-2">
              <Smartphone className="w-4 h-4 text-pink-400" />
              <span>Mobile Touchscreen Controls</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
              <li>
                <strong className="text-white">Virtual D-Pad:</strong> Hold the directional arrows on the bottom-left to
                steer your ball.
              </li>
              <li>
                <strong className="text-white">Jump Button:</strong> Tap the large glowing button on the bottom-right to leap over
                gaps.
              </li>
              <li>
                <strong className="text-white">Touch Drag:</strong> Swipe and drag directly on the ball to rotate in 3D. Tap to
                squish and bounce!
              </li>
            </ul>
          </div>

          {/* Gameplay Goals */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center gap-2 text-white font-bold mb-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Game Modes & Goals</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
              <li>
                <strong className="text-white">Arcade Campaign:</strong> Collect all gold stars and coins, navigate moving
                platforms, dodge hazards, and reach the glowing green exit portal.
              </li>
              <li>
                <strong className="text-white">Color Catcher:</strong> Roll into orbs matching your designated target color.
              </li>
              <li>
                <strong className="text-white">Customization Studio:</strong> Unleash your creativity with independent eye
                colors (heterochromia), animated expressions, shiny materials, patterns, and legendary accessories!
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playSfx('click');
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow hover:brightness-110 cursor-pointer"
        >
          Got It, Let's Roll!
        </button>
      </div>
    </div>
  );
};
