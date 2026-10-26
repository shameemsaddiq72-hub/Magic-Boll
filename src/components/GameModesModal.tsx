/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Play, ShieldAlert, Sparkles, Target, Palette, Heart, Compass } from 'lucide-react';
import { GameModeType } from '../types/ball';
import { sound } from '../utils/audio';

interface GameModesModalProps {
  onClose: () => void;
  onSelectMode: (mode: GameModeType, levelIdx?: number) => void;
}

export const GameModesModal: React.FC<GameModesModalProps> = ({ onClose, onSelectMode }) => {
  const modes: {
    id: GameModeType;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'arcade',
      title: 'Arcade Campaign',
      description: '5 challenging levels with platforms, gems, stars, moving hazards, and goal portals.',
      icon: <Play className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-900/40 to-teal-900/40 border-emerald-500/40',
    },
    {
      id: 'freeplay',
      title: 'Free Play Playground',
      description: 'Move, bounce, and experiment freely across trampolines and ramps with no timer.',
      icon: <Compass className="w-6 h-6 text-cyan-400" />,
      color: 'from-cyan-900/40 to-blue-900/40 border-cyan-500/40',
    },
    {
      id: 'color-catcher',
      title: 'Color Catcher',
      description: 'Collect floating orbs of the requested target color. Avoid the wrong colors!',
      icon: <Target className="w-6 h-6 text-pink-400" />,
      color: 'from-pink-900/40 to-rose-900/40 border-pink-500/40',
    },
    {
      id: 'obstacle-escape',
      title: 'Obstacle Escape',
      description: 'Endurance run dodging spinning hazards, moving bumpers, and falling gaps.',
      icon: <ShieldAlert className="w-6 h-6 text-amber-400" />,
      color: 'from-amber-900/40 to-orange-900/40 border-amber-500/40',
    },
    {
      id: 'ball-challenge',
      title: 'Ball Precision Trial',
      description: 'Navigate narrow platforms and time trials with maximum agility and control.',
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-900/40 to-indigo-900/40 border-purple-500/40',
    },
    {
      id: 'customization-challenge',
      title: 'Customization Match',
      description: 'Match specific target ball styles (colors, eyes, patterns, accessories) to earn coin bounties.',
      icon: <Palette className="w-6 h-6 text-yellow-400" />,
      color: 'from-yellow-900/40 to-amber-900/40 border-yellow-500/40',
    },
    {
      id: 'relax',
      title: 'Relax Mode',
      description: 'Peaceful zen meadow with gentle floating pads, calming chimes, and no penalties.',
      icon: <Heart className="w-6 h-6 text-teal-400" />,
      color: 'from-teal-900/40 to-emerald-900/40 border-teal-500/40',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 md:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white">SELECT GAME MODE</h2>
            <p className="text-xs md:text-sm text-slate-400">Choose your favorite way to play!</p>
          </div>
          <button
            onClick={() => {
              sound.playSfx('click');
              onClose();
            }}
            aria-label="Close Game Modes"
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-3 pr-1">
          {modes.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                sound.playSfx('click');
                onSelectMode(m.id);
              }}
              className={`flex items-start gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r ${m.color} border hover:scale-[1.01] transition-transform cursor-pointer shadow-md`}
            >
              <div className="p-2.5 rounded-xl bg-slate-900/80 shadow">{m.icon}</div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white mb-0.5">{m.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{m.description}</p>
              </div>
              <button className="px-3 py-1.5 rounded-xl bg-white text-slate-950 font-bold text-xs shadow hover:bg-slate-200">
                PLAY
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
