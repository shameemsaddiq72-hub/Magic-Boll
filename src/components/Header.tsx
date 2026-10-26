/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Sparkles, Settings as SettingsIcon, Coins } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  coins: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenRewards: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  coins,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenRewards,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/30 text-amber-300 font-semibold text-sm shadow-md">
          <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>{coins}</span>
          <button
            onClick={() => {
              sound.playSfx('click');
              onOpenRewards();
            }}
            className="ml-1 text-xs text-amber-400 underline hover:text-amber-200 cursor-pointer"
            title="Claim daily coins"
          >
            +Get
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => {
            sound.playSfx('click');
            onToggleMute();
          }}
          className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition shadow cursor-pointer"
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>

        <button
          onClick={() => {
            sound.playSfx('click');
            onOpenSettings();
          }}
          className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition shadow cursor-pointer"
          aria-label="Game Settings"
          title="Settings"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
