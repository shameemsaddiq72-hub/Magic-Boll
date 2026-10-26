/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Shuffle,
  RotateCcw,
  Undo2,
  Redo2,
  Save,
  FolderOpen,
  Heart,
  Palette,
  Eye,
  Smile,
  Layers,
  Sparkles,
  Maximize2,
  Sparkle,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  BallConfig,
  BallMaterialType,
  PatternType,
  EyeShapeType,
  ExpressionType,
  AccessoryType,
  EffectType,
  BallShapeType,
} from '../types/ball';
import { sound } from '../utils/audio';

interface CustomizationStudioProps {
  currentBall: BallConfig;
  onChange: (ball: BallConfig) => void;
  onBack: () => void;
  onSaveLook: () => void;
  onLoadLook: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetAll: () => void;
  onRandomize: () => void;
  onToggleFavorite: () => void;
}

type TabType = 'color' | 'eyes' | 'expression' | 'material' | 'pattern' | 'shape' | 'accessory' | 'effects';

export const CustomizationStudio: React.FC<CustomizationStudioProps> = ({
  currentBall,
  onChange,
  onBack,
  onSaveLook,
  onLoadLook,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetAll,
  onRandomize,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('color');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Predefined swatches
  const BALL_COLORS = [
    { label: 'Red', color: '#EF4444' },
    { label: 'Blue', color: '#3B82F6' },
    { label: 'Green', color: '#10B981' },
    { label: 'Yellow', color: '#EAB308' },
    { label: 'Orange', color: '#F97316' },
    { label: 'Pink', color: '#EC4899' },
    { label: 'Purple', color: '#8B5CF6' },
    { label: 'Cyan', color: '#06B6D4' },
    { label: 'Turquoise', color: '#14B8A6' },
    { label: 'Black', color: '#0F172A' },
    { label: 'White', color: '#F8FAFC' },
    { label: 'Gold', color: '#F59E0B' },
    { label: 'Silver', color: '#94A3B8' },
  ];

  const GRADIENTS = [
    { id: 'none', label: 'Solid' },
    { id: 'sunset', label: 'Sunset' },
    { id: 'ocean', label: 'Ocean' },
    { id: 'galaxy', label: 'Galaxy' },
    { id: 'neon', label: 'Neon' },
    { id: 'rainbow', label: 'Rainbow' },
    { id: 'fire', label: 'Fire' },
    { id: 'ice', label: 'Ice' },
    { id: 'candy', label: 'Candy' },
  ];

  const EYE_COLORS = [
    { label: 'Blue', color: '#3B82F6' },
    { label: 'Sky Blue', color: '#38BDF8' },
    { label: 'Green', color: '#22C55E' },
    { label: 'Emerald', color: '#10B981' },
    { label: 'Brown', color: '#78350F' },
    { label: 'Hazel', color: '#A16207' },
    { label: 'Black', color: '#18181B' },
    { label: 'Gray', color: '#64748B' },
    { label: 'Purple', color: '#A855F7' },
    { label: 'Pink', color: '#EC4899' },
    { label: 'Red', color: '#EF4444' },
    { label: 'Gold', color: '#FBBF24' },
    { label: 'Cyan', color: '#06B6D4' },
  ];

  const MATERIALS: { id: BallMaterialType; label: string }[] = [
    { id: 'glossy', label: 'Glossy Plastic' },
    { id: 'rubber', label: 'Rubber Matte' },
    { id: 'chrome', label: 'Metallic Chrome' },
    { id: 'gold', label: 'Pure Gold' },
    { id: 'silver', label: 'Liquid Silver' },
    { id: 'glass', label: 'Glass-like' },
    { id: 'crystal', label: 'Crystal Gem' },
    { id: 'neon', label: 'Neon Glow' },
    { id: 'jelly', label: 'Squishy Jelly' },
    { id: 'holographic', label: 'Holographic' },
    { id: 'ice', label: 'Frozen Ice' },
    { id: 'lava', label: 'Magma Lava' },
    { id: 'galaxy', label: 'Cosmic Galaxy' },
  ];

  const PATTERNS: { id: PatternType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'stripes', label: 'Stripes' },
    { id: 'dots', label: 'Dots' },
    { id: 'stars', label: 'Stars' },
    { id: 'hearts', label: 'Hearts' },
    { id: 'lightning', label: 'Lightning' },
    { id: 'flames', label: 'Flames' },
    { id: 'clouds', label: 'Clouds' },
    { id: 'spirals', label: 'Spirals' },
    { id: 'checkerboard', label: 'Checkerboard' },
    { id: 'geometric', label: 'Geometric' },
    { id: 'galaxy', label: 'Galaxy' },
  ];

  const EYE_SHAPES: { id: EyeShapeType; label: string }[] = [
    { id: 'cute-round', label: 'Cute Round' },
    { id: 'large-cartoon', label: 'Large Cartoon' },
    { id: 'anime', label: 'Anime Starlet' },
    { id: 'robot', label: 'Robot Visor' },
    { id: 'neon', label: 'Neon Cyber' },
    { id: 'star', label: 'Star Pupil' },
    { id: 'heart', label: 'Heart Pupil' },
    { id: 'spiral', label: 'Hypno Spiral' },
    { id: 'sleepy', label: 'Sleepy Half' },
    { id: 'angry', label: 'Fierce Slanted' },
    { id: 'surprised', label: 'Wide Surprised' },
  ];

  const EXPRESSIONS: { id: ExpressionType; label: string; icon: string }[] = [
    { id: 'happy', label: 'Happy', icon: '😊' },
    { id: 'sad', label: 'Sad', icon: '🥺' },
    { id: 'angry', label: 'Angry', icon: '😠' },
    { id: 'excited', label: 'Excited', icon: '🤩' },
    { id: 'sleepy', label: 'Sleepy', icon: '😴' },
    { id: 'surprised', label: 'Surprised', icon: '😲' },
    { id: 'confused', label: 'Confused', icon: '🤔' },
    { id: 'laughing', label: 'Laughing', icon: '😆' },
    { id: 'wink', label: 'Wink', icon: '😉' },
    { id: 'love-struck', label: 'Love-struck', icon: '😍' },
  ];

  const ACCESSORIES: { id: AccessoryType; label: string; icon: string }[] = [
    { id: 'none', label: 'None', icon: '🚫' },
    { id: 'crown', label: 'Royal Crown', icon: '👑' },
    { id: 'hat', label: 'Top Hat', icon: '🎩' },
    { id: 'sunglasses', label: 'Cool Shades', icon: '🕶️' },
    { id: 'headphones', label: 'Headphones', icon: '🎧' },
    { id: 'bow', label: 'Ribbon Bow', icon: '🎀' },
    { id: 'wings', label: 'Angel Wings', icon: '🪽' },
    { id: 'horns', label: 'Demon Horns', icon: '😈' },
    { id: 'stars', label: 'Halo Stars', icon: '⭐' },
    { id: 'flower', label: 'Spring Flower', icon: '🌸' },
    { id: 'mask', label: 'Hero Mask', icon: '🎭' },
  ];

  const EFFECTS: { id: EffectType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'neon-glow', label: 'Neon Glow' },
    { id: 'fire-trail', label: 'Fire Trail' },
    { id: 'ice-trail', label: 'Frost Trail' },
    { id: 'rainbow-trail', label: 'Rainbow Trail' },
    { id: 'sparkles', label: 'Sparkles' },
    { id: 'stars', label: 'Orbiting Stars' },
    { id: 'lightning', label: 'Electric Sparks' },
    { id: 'magical-aura', label: 'Mystic Aura' },
  ];

  const SHAPES: { id: BallShapeType; label: string }[] = [
    { id: 'sphere', label: 'Perfect Sphere' },
    { id: 'squishy', label: 'Soft Squishy' },
    { id: 'jelly', label: 'Jelly Ball' },
    { id: 'puffy', label: 'Puffy Ball' },
  ];

  const handleUpdate = (partial: Partial<BallConfig>) => {
    sound.playSfx('change');
    onChange({ ...currentBall, ...partial });
  };

  const handleEyesUpdate = (partialEyes: Partial<typeof currentBall.eyes>) => {
    sound.playSfx('change');
    onChange({
      ...currentBall,
      eyes: { ...currentBall.eyes, ...partialEyes },
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none z-20">
      {/* Top Action Bar */}
      <div className="p-3 md:p-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playSfx('click');
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition shadow cursor-pointer text-xs md:text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Quick Studio Tools */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-700/80 shadow">
          <button
            onClick={() => {
              sound.playSfx('click');
              onUndo();
            }}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              onRedo();
            }}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          <button
            onClick={() => {
              sound.playSfx('whoosh');
              onRandomize();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 text-xs font-semibold cursor-pointer transition"
            title="Generate Random Style"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Random</span>
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              onToggleFavorite();
            }}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              currentBall.isFavorite
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-slate-300 hover:text-rose-400 hover:bg-slate-800'
            }`}
            title="Favorite"
          >
            <Heart className={`w-4 h-4 ${currentBall.isFavorite ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              onSaveLook();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs font-semibold cursor-pointer transition"
            title="Save Look"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              onLoadLook();
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition"
            title="Load Stored Looks"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playSfx('click');
              onResetAll();
            }}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition"
            title="Reset Default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center 3D Viewport is unobstructed */}

      {/* Ergonomic Bottom Studio Dock */}
      <div className="w-full max-w-4xl mx-auto px-2 md:px-4 pb-2 pointer-events-auto">
        <div className="flex justify-center -mb-2 z-10 relative">
          <button
            onClick={() => {
              sound.playSfx('click');
              setIsCollapsed(!isCollapsed);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-medium shadow cursor-pointer"
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isCollapsed ? 'Show Studio Options' : 'Hide Controls'}</span>
          </button>
        </div>

        {!isCollapsed && (
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-3 md:p-4 shadow-2xl backdrop-blur-xl transition-all">
            {/* Category Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800 text-xs font-semibold">
              <button
                onClick={() => {
                  sound.playSfx('click');
                  setActiveTab('color');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'color' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Color</span>
              </button>

              <button
                onClick={() => {
                  sound.playSfx('click');
                  setActiveTab('eyes');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'eyes' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Eyes</span>
              </button>

              <button
                onClick={() => {
                  sound.playSfx('click');
                  setActiveTab('expression');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'expression' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Face</span>
              </button>

              <button
                onClick={() => {
                  sound.playSfx('click');
                  setActiveTab('material');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'material' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Material</span>
              </button>

              <button
                onClick={() => {
                  sound.playSfx('click');
                  setActiveTab('pattern');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'pattern' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkle className="w-3.5 h-3.5" />
                <span>Pattern</span>
              </button>

              <button
                onClick={() => {
                  sound.playSfx('click');
                  setActiveTab('shape');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'shape' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Shape</span>
              </button>

              <button
                onClick={() => {
                  sound.playSfx('click');
                  setActiveTab('accessory');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'accessory' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Accessory</span>
              </button>

              <button
                onClick={() => {
                  sound.playSfx('click');
                  setActiveTab('effects');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'effects' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Effects</span>
              </button>
            </div>

            {/* Tab Content Panel */}
            <div className="pt-3 max-h-48 md:max-h-56 overflow-y-auto pr-1">
              {/* TAB 1: COLOR */}
              {activeTab === 'color' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Base Ball Color
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {BALL_COLORS.map((item) => (
                        <button
                          key={item.color}
                          onClick={() => handleUpdate({ color: item.color })}
                          className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer relative ${
                            currentBall.color === item.color
                              ? 'border-white scale-110 shadow-lg'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.label}
                        >
                          {currentBall.color === item.color && (
                            <Check className="w-3.5 h-3.5 text-white drop-shadow mx-auto" />
                          )}
                        </button>
                      ))}

                      {/* Custom Color Input */}
                      <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-700">
                        <label className="text-xs text-slate-400 font-medium cursor-pointer">Custom:</label>
                        <input
                          type="color"
                          value={currentBall.color}
                          onChange={(e) => handleUpdate({ color: e.target.value })}
                          className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={currentBall.color}
                          onChange={(e) => handleUpdate({ color: e.target.value })}
                          className="w-20 px-2 py-1 rounded bg-slate-800 text-xs text-white border border-slate-700 font-mono"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Gradient Theme
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {GRADIENTS.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => handleUpdate({ gradient: g.id })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition ${
                            currentBall.gradient === g.id
                              ? 'bg-amber-500 text-slate-950 font-bold shadow'
                              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EYES */}
              {activeTab === 'eyes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                      <input
                        type="checkbox"
                        checked={currentBall.eyes.lockTogether}
                        onChange={(e) => handleEyesUpdate({ lockTogether: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-indigo-500 cursor-pointer w-4 h-4"
                      />
                      <span>Lock Eyes Together (Same Color)</span>
                    </label>

                    <button
                      onClick={() => {
                        sound.playSfx('change');
                        handleEyesUpdate({
                          leftColor: '#10B981',
                          rightColor: '#10B981',
                          size: 1.0,
                          spacing: 1.0,
                          pupilSize: 1.0,
                          pupilDirX: 0,
                          pupilDirY: 0,
                          shine: true,
                        });
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      Reset Eyes
                    </button>
                  </div>

                  {/* Left / Both Eye Color */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      {currentBall.eyes.lockTogether ? 'Eye Color' : 'Left Eye Color'}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {EYE_COLORS.map((item) => (
                        <button
                          key={item.color}
                          onClick={() => {
                            if (currentBall.eyes.lockTogether) {
                              handleEyesUpdate({ leftColor: item.color, rightColor: item.color });
                            } else {
                              handleEyesUpdate({ leftColor: item.color });
                            }
                          }}
                          className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer relative ${
                            currentBall.eyes.leftColor === item.color
                              ? 'border-white scale-110 shadow'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.label}
                        />
                      ))}
                      <input
                        type="color"
                        value={currentBall.eyes.leftColor}
                        onChange={(e) => {
                          if (currentBall.eyes.lockTogether) {
                            handleEyesUpdate({ leftColor: e.target.value, rightColor: e.target.value });
                          } else {
                            handleEyesUpdate({ leftColor: e.target.value });
                          }
                        }}
                        className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>

                  {/* Right Eye Color (when unlocked) */}
                  {!currentBall.eyes.lockTogether && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Right Eye Color (Heterochromia)
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {EYE_COLORS.map((item) => (
                          <button
                            key={item.color}
                            onClick={() => handleEyesUpdate({ rightColor: item.color })}
                            className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer relative ${
                              currentBall.eyes.rightColor === item.color
                                ? 'border-white scale-110 shadow'
                                : 'border-transparent hover:scale-105'
                            }`}
                            style={{ backgroundColor: item.color }}
                            title={item.label}
                          />
                        ))}
                        <input
                          type="color"
                          value={currentBall.eyes.rightColor}
                          onChange={(e) => handleEyesUpdate({ rightColor: e.target.value })}
                          className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0"
                        />
                      </div>
                    </div>
                  )}

                  {/* Sliders */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">Size ({currentBall.eyes.size.toFixed(1)}x)</span>
                      <input
                        type="range"
                        min="0.6"
                        max="1.4"
                        step="0.05"
                        value={currentBall.eyes.size}
                        onChange={(e) => handleEyesUpdate({ size: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">Spacing ({currentBall.eyes.spacing.toFixed(1)}x)</span>
                      <input
                        type="range"
                        min="0.7"
                        max="1.3"
                        step="0.05"
                        value={currentBall.eyes.spacing}
                        onChange={(e) => handleEyesUpdate({ spacing: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">Pupil Size ({currentBall.eyes.pupilSize.toFixed(1)}x)</span>
                      <input
                        type="range"
                        min="0.5"
                        max="1.3"
                        step="0.05"
                        value={currentBall.eyes.pupilSize}
                        onChange={(e) => handleEyesUpdate({ pupilSize: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center pt-3">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-medium">
                        <input
                          type="checkbox"
                          checked={currentBall.eyes.shine}
                          onChange={(e) => handleEyesUpdate({ shine: e.target.checked })}
                          className="rounded text-indigo-500"
                        />
                        <span>Eye Shine</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EXPRESSION & SHAPE */}
              {activeTab === 'expression' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Facial Expression
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {EXPRESSIONS.map((exp) => (
                        <button
                          key={exp.id}
                          onClick={() => handleEyesUpdate({ expression: exp.id })}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
                            currentBall.eyes.expression === exp.id
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <span className="text-base">{exp.icon}</span>
                          <span>{exp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Eye Style & Pupils
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {EYE_SHAPES.map((sh) => (
                        <button
                          key={sh.id}
                          onClick={() => handleEyesUpdate({ shape: sh.id })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition ${
                            currentBall.eyes.shape === sh.id
                              ? 'bg-indigo-600 text-white font-bold shadow'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {sh.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MATERIAL */}
              {activeTab === 'material' && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Surface Material Finish
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {MATERIALS.map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => handleUpdate({ material: mat.id })}
                        className={`p-2.5 rounded-xl text-xs font-semibold cursor-pointer text-left transition border ${
                          currentBall.material === mat.id
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow'
                            : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {mat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: PATTERN */}
              {activeTab === 'pattern' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Pattern Preset
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PATTERNS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleUpdate({ pattern: p.id })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                            currentBall.pattern === p.id
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentBall.pattern !== 'none' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Pattern Color:</span>
                        <input
                          type="color"
                          value={currentBall.patternColor}
                          onChange={(e) => handleUpdate({ patternColor: e.target.value })}
                          className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Pattern Scale</span>
                          <span>{currentBall.patternScale}x</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          step="1"
                          value={currentBall.patternScale}
                          onChange={(e) => handleUpdate({ patternScale: parseInt(e.target.value, 10) })}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: SHAPE & SIZE */}
              {activeTab === 'shape' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Ball Geometry Variation
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SHAPES.map((sh) => (
                        <button
                          key={sh.id}
                          onClick={() => handleUpdate({ shape: sh.id })}
                          className={`p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                            currentBall.shape === sh.id
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {sh.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Ball Size</span>
                      <span>{currentBall.size.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.3"
                      step="0.05"
                      value={currentBall.size}
                      onChange={(e) => handleUpdate({ size: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 7: ACCESSORY */}
              {activeTab === 'accessory' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Select 3D Accessory
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ACCESSORIES.map((acc) => (
                        <button
                          key={acc.id}
                          onClick={() => handleUpdate({ accessory: acc.id })}
                          className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                            currentBall.accessory === acc.id
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <span className="text-base">{acc.icon}</span>
                          <span>{acc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentBall.accessory !== 'none' && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-400 font-medium">Accessory Color:</span>
                      <input
                        type="color"
                        value={currentBall.accessoryColor}
                        onChange={(e) => handleUpdate({ accessoryColor: e.target.value })}
                        className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: EFFECTS */}
              {activeTab === 'effects' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Glow & Trail Aura Effects
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {EFFECTS.map((eff) => (
                        <button
                          key={eff.id}
                          onClick={() => handleUpdate({ effect: eff.id })}
                          className={`p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                            currentBall.effect === eff.id
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {eff.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentBall.effect !== 'none' && (
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Effect Intensity</span>
                        <span>{currentBall.effectIntensity.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.4"
                        max="1.5"
                        step="0.1"
                        value={currentBall.effectIntensity}
                        onChange={(e) => handleUpdate({ effectIntensity: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
