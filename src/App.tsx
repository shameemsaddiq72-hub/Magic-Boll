/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BallConfig, GameModeType, GameSettings, PlayerStats, Achievement } from './types/ball';
import {
  loadStoredBall,
  saveStoredBall,
  loadSavedLooks,
  saveLook,
  loadSettings,
  saveSettings,
  loadStats,
  saveStats,
  loadAchievements,
  saveAchievements,
  DEFAULT_BALL,
  PRESET_BALLS,
} from './utils/storage';
import { updateAchievementsProgress } from './game/rules';
import { sound } from './utils/audio';
import { ThreeScene } from './three/ThreeScene';
import { GameArena } from './three/GameArena';

import { Header } from './components/Header';
import { MainMenu } from './components/MainMenu';
import { CustomizationStudio } from './components/CustomizationStudio';
import { GameHUD } from './components/GameHUD';
import { GameModesModal } from './components/GameModesModal';
import { MyBallsModal } from './components/MyBallsModal';
import { RewardsModal } from './components/RewardsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { CustomizationChallengeModal } from './components/CustomizationChallengeModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';

export default function App() {
  // Screen state
  const [screen, setScreen] = useState<'menu' | 'customize' | 'game'>('menu');
  const [activeGameMode, setActiveGameMode] = useState<GameModeType>('arcade');
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);

  // Ball configuration & history stack for Undo/Redo
  const [ball, setBall] = useState<BallConfig>(() => loadStoredBall());
  const [undoStack, setUndoStack] = useState<BallConfig[]>([]);
  const [redoStack, setRedoStack] = useState<BallConfig[]>([]);

  // Persistent storage state
  const [savedLooks, setSavedLooks] = useState<BallConfig[]>(() => loadSavedLooks());
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [stats, setStats] = useState<PlayerStats>(() => loadStats());
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadAchievements());

  // Active Modals
  const [showGameModes, setShowGameModes] = useState(false);
  const [showMyBalls, setShowMyBalls] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showCustomChallenge, setShowCustomChallenge] = useState(false);

  // Gameplay HUD & Win State
  const [gameScore, setGameScore] = useState(0);
  const [gameCoins, setGameCoins] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [levelWinData, setLevelWinData] = useState<{ timeUsed: number } | null>(null);

  // 3D Canvas Mount Refs
  const previewCanvasRef = useRef<HTMLDivElement>(null);
  const gameCanvasRef = useRef<HTMLDivElement>(null);
  const threeSceneRef = useRef<ThreeScene | null>(null);
  const gameArenaRef = useRef<GameArena | null>(null);

  // Initialize Audio with saved settings
  useEffect(() => {
    sound.setVolumes(settings.masterVolume, settings.musicVolume, settings.sfxVolume, settings.muted);
  }, []);

  // Mount Studio Preview Scene (for menu and customize screens)
  useEffect(() => {
    if ((screen === 'menu' || screen === 'customize') && previewCanvasRef.current) {
      if (!threeSceneRef.current) {
        threeSceneRef.current = new ThreeScene(previewCanvasRef.current, ball);
      } else {
        threeSceneRef.current.updateBall(ball);
      }
    }

    const handleResize = () => {
      threeSceneRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [screen]);

  // Keep studio preview updated when ball changes
  useEffect(() => {
    if (threeSceneRef.current) {
      threeSceneRef.current.updateBall(ball);
    }
    saveStoredBall(ball);

    // Track colors tried & custom eyes for achievements
    setStats((prev) => {
      const colors = prev.colorsTried.includes(ball.color) ? prev.colorsTried : [...prev.colorsTried, ball.color];
      const customEye = prev.customEyeCreated || !ball.eyes.lockTogether || ball.eyes.leftColor !== ball.eyes.rightColor;
      const nextStats = { ...prev, colorsTried: colors, customEyeCreated: customEye };
      saveStats(nextStats);
      return nextStats;
    });
  }, [ball]);

  // Sync Achievements whenever stats change
  useEffect(() => {
    const updated = updateAchievementsProgress(stats, achievements);
    setAchievements(updated);
    saveAchievements(updated);
  }, [stats]);

  // Mount Game Arena when entering gameplay
  useEffect(() => {
    if (screen === 'game' && gameCanvasRef.current) {
      // Clean up old arena if exists
      if (gameArenaRef.current) {
        gameArenaRef.current.dispose();
        gameArenaRef.current = null;
      }

      setLevelWinData(null);
      setIsGamePaused(false);

      gameArenaRef.current = new GameArena(
        gameCanvasRef.current,
        ball,
        currentLevelIdx,
        activeGameMode,
        settings.difficulty,
        {
          onScoreUpdate: (score, coins, stars) => {
            setGameScore(score);
            setGameCoins(coins);
            setStarsCollected(stars);
          },
          onStarCollected: (collected, total) => {
            setStarsCollected(collected);
            setTotalStars(total);
          },
          onLevelComplete: (timeUsed) => {
            setLevelWinData({ timeUsed });
            // Update stats
            setStats((prev) => {
              const next = {
                ...prev,
                coins: prev.coins + gameCoins + 30,
                starsCollected: prev.starsCollected + starsCollected,
                levelsCompleted: Math.max(prev.levelsCompleted, currentLevelIdx + 1),
                highScore: Math.max(prev.highScore, gameScore),
              };
              saveStats(next);
              return next;
            });
          },
          onGameOver: () => {
            // Respawn handled internally by GameArena
          },
          onCheckpointReached: () => {
            sound.playSfx('change');
          },
        }
      );

      const handleGameResize = () => {
        gameArenaRef.current?.resize();
      };
      window.addEventListener('resize', handleGameResize);

      return () => {
        window.removeEventListener('resize', handleGameResize);
        if (gameArenaRef.current) {
          gameArenaRef.current.dispose();
          gameArenaRef.current = null;
        }
      };
    }
  }, [screen, currentLevelIdx, activeGameMode]);

  // Keyboard navigation & game controls
  useEffect(() => {
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger game shortcuts while typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      keysPressed[e.code] = true;

      if (e.code === 'KeyM') {
        const isMutedNow = !settings.muted;
        const newSettings = { ...settings, muted: isMutedNow };
        setSettings(newSettings);
        saveSettings(newSettings);
        sound.setVolumes(newSettings.masterVolume, newSettings.musicVolume, newSettings.sfxVolume, isMutedNow);
      }

      if (e.code === 'Escape') {
        if (showGameModes || showMyBalls || showRewards || showAchievements || showSettings || showHowToPlay || showCustomChallenge) {
          setShowGameModes(false);
          setShowMyBalls(false);
          setShowRewards(false);
          setShowAchievements(false);
          setShowSettings(false);
          setShowHowToPlay(false);
          setShowCustomChallenge(false);
        } else if (screen === 'game') {
          setIsGamePaused((prev) => {
            if (prev) {
              gameArenaRef.current?.resume();
              return false;
            } else {
              gameArenaRef.current?.pause();
              return true;
            }
          });
        }
      }

      if (e.code === 'KeyR' && screen === 'game') {
        gameArenaRef.current?.restart();
      }

      // Update inputs in game arena
      if (screen === 'game' && gameArenaRef.current) {
        let x = 0;
        let z = 0;
        if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) x -= 1;
        if (keysPressed['KeyD'] || keysPressed['ArrowRight']) x += 1;
        if (keysPressed['KeyW'] || keysPressed['ArrowUp']) z -= 1;
        if (keysPressed['KeyS'] || keysPressed['ArrowDown']) z += 1;
        const jump = keysPressed['Space'] || false;
        gameArenaRef.current.setInput(x, z, jump);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;

      if (screen === 'game' && gameArenaRef.current) {
        let x = 0;
        let z = 0;
        if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) x -= 1;
        if (keysPressed['KeyD'] || keysPressed['ArrowRight']) x += 1;
        if (keysPressed['KeyW'] || keysPressed['ArrowUp']) z -= 1;
        if (keysPressed['KeyS'] || keysPressed['ArrowDown']) z += 1;
        gameArenaRef.current.setInput(x, z, false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen, settings, showGameModes, showMyBalls, showRewards, showAchievements, showSettings, showHowToPlay, showCustomChallenge]);

  // Customization undo/redo actions
  const handleBallChange = (newBall: BallConfig) => {
    setUndoStack((prev) => [...prev.slice(-20), ball]);
    setRedoStack([]);
    setBall(newBall);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setRedoStack((s) => [...s, ball]);
    setBall(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((s) => s.slice(0, -1));
    setUndoStack((s) => [...s, ball]);
    setBall(next);
  };

  const handleRandomize = () => {
    const randomPreset = PRESET_BALLS[Math.floor(Math.random() * PRESET_BALLS.length)];
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#EAB308', '#EC4899', '#8B5CF6', '#06B6D4'];
    const eyeColors = ['#38BDF8', '#10B981', '#F59E0B', '#EF4444', '#A855F7', '#EC4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomEye = eyeColors[Math.floor(Math.random() * eyeColors.length)];

    const randomBall: BallConfig = {
      ...ball,
      color: randomColor,
      material: randomPreset.material,
      pattern: randomPreset.pattern,
      patternColor: randomEye,
      accessory: randomPreset.accessory,
      accessoryColor: randomColor,
      effect: randomPreset.effect,
      eyes: {
        ...ball.eyes,
        leftColor: randomEye,
        rightColor: randomEye,
        expression: randomPreset.eyes.expression,
      },
    };
    handleBallChange(randomBall);
  };

  const handleResetAll = () => {
    if (confirm('Reset your ball to default appearance?')) {
      handleBallChange(DEFAULT_BALL);
    }
  };

  const handleSaveLook = () => {
    setShowMyBalls(true);
  };

  const handleUnlockBall = (presetId: string, cost: number) => {
    if (stats.coins >= cost) {
      setStats((prev) => {
        const next = {
          ...prev,
          coins: prev.coins - cost,
          unlockedBalls: [...prev.unlockedBalls, presetId],
        };
        saveStats(next);
        return next;
      });
    }
  };

  const handleClaimAchievement = (id: string, coins: number) => {
    setStats((prev) => {
      const next = { ...prev, coins: prev.coins + coins };
      saveStats(next);
      return next;
    });
    setAchievements((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, claimed: true } : a));
      saveAchievements(next);
      return next;
    });
  };

  const LEVEL_NAMES = [
    'Level 1: Colorful Training Arena',
    'Level 2: Floating Platforms',
    'Level 3: Moving Obstacles',
    'Level 4: Neon Challenge',
    'Level 5: Magic Crystal Arena',
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none text-white">
      {/* Universal Top Header (Only on menu screen to avoid overlap) */}
      {screen === 'menu' && (
        <Header
          coins={stats.coins}
          isMuted={settings.muted}
          onToggleMute={() => {
            const isMutedNow = !settings.muted;
            const newSettings = { ...settings, muted: isMutedNow };
            setSettings(newSettings);
            saveSettings(newSettings);
            sound.setVolumes(newSettings.masterVolume, newSettings.musicVolume, newSettings.sfxVolume, isMutedNow);
          }}
          onOpenSettings={() => setShowSettings(true)}
          onOpenRewards={() => setShowRewards(true)}
        />
      )}

      {/* 3D Viewport Containers */}
      {(screen === 'menu' || screen === 'customize') && (
        <div
          ref={previewCanvasRef}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
        />
      )}

      {screen === 'game' && (
        <div ref={gameCanvasRef} className="absolute inset-0 w-full h-full z-0" />
      )}

      {/* Screen 1: MAIN MENU */}
      {screen === 'menu' && (
        <MainMenu
          onPlay={() => {
            setActiveGameMode('arcade');
            setCurrentLevelIdx(0);
            setScreen('game');
          }}
          onCustomize={() => setScreen('customize')}
          onGameModes={() => setShowGameModes(true)}
          onMyBalls={() => setShowMyBalls(true)}
          onRewards={() => setShowRewards(true)}
          onAchievements={() => setShowAchievements(true)}
          onSettings={() => setShowSettings(true)}
          onHowToPlay={() => setShowHowToPlay(true)}
          onTapBall={() => threeSceneRef.current?.triggerTapReaction()}
        />
      )}

      {/* Screen 2: CUSTOMIZATION STUDIO */}
      {screen === 'customize' && (
        <CustomizationStudio
          currentBall={ball}
          onChange={handleBallChange}
          onBack={() => setScreen('menu')}
          onSaveLook={handleSaveLook}
          onLoadLook={() => setShowMyBalls(true)}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onResetAll={handleResetAll}
          onRandomize={handleRandomize}
          onToggleFavorite={() => handleBallChange({ ...ball, isFavorite: !ball.isFavorite })}
        />
      )}

      {/* Screen 3: PLAYABLE GAME HUD */}
      {screen === 'game' && (
        <GameHUD
          levelName={
            activeGameMode === 'arcade'
              ? LEVEL_NAMES[currentLevelIdx] || `Level ${currentLevelIdx + 1}`
              : activeGameMode.toUpperCase().replace('-', ' ')
          }
          score={gameScore}
          coins={gameCoins}
          starsCollected={starsCollected}
          totalStars={totalStars}
          targetColor={activeGameMode === 'color-catcher' ? gameArenaRef.current?.targetColor : undefined}
          isPaused={isGamePaused}
          onPause={() => {
            setIsGamePaused(true);
            gameArenaRef.current?.pause();
          }}
          onResume={() => {
            setIsGamePaused(false);
            gameArenaRef.current?.resume();
          }}
          onRestart={() => {
            gameArenaRef.current?.restart();
            setIsGamePaused(false);
          }}
          onQuitToMenu={() => {
            setScreen('menu');
          }}
          onVirtualInput={(x, z, jump) => {
            gameArenaRef.current?.setInput(x, z, jump);
          }}
        />
      )}

      {/* Level Win Modal */}
      {levelWinData && (
        <LevelCompleteModal
          levelIdx={currentLevelIdx}
          score={gameScore}
          coinsEarned={gameCoins + 30}
          starsCollected={starsCollected}
          totalStars={totalStars}
          timeUsedSec={levelWinData.timeUsed}
          onNextLevel={() => {
            setCurrentLevelIdx((prev) => Math.min(4, prev + 1));
            setLevelWinData(null);
          }}
          onReplay={() => {
            gameArenaRef.current?.restart();
            setLevelWinData(null);
          }}
          onQuitToMenu={() => {
            setScreen('menu');
            setLevelWinData(null);
          }}
        />
      )}

      {/* Modals */}
      {showGameModes && (
        <GameModesModal
          onClose={() => setShowGameModes(false)}
          onSelectMode={(mode, levelIdx = 0) => {
            setActiveGameMode(mode);
            setCurrentLevelIdx(levelIdx);
            setShowGameModes(false);
            if (mode === 'customization-challenge') {
              setShowCustomChallenge(true);
            } else {
              setScreen('game');
            }
          }}
        />
      )}

      {showMyBalls && (
        <MyBallsModal
          currentBall={ball}
          savedLooks={savedLooks}
          unlockedBalls={stats.unlockedBalls}
          coins={stats.coins}
          onClose={() => setShowMyBalls(false)}
          onLoadBall={(loadedBall) => {
            setBall(loadedBall);
          }}
          onUnlockBall={handleUnlockBall}
          onRefreshLooks={() => {
            const updated = loadSavedLooks();
            setSavedLooks(updated);
            setStats((prev) => {
              const next = { ...prev, savedLooksCount: updated.length };
              saveStats(next);
              return next;
            });
          }}
        />
      )}

      {showRewards && (
        <RewardsModal
          coins={stats.coins}
          starsCollected={stats.starsCollected}
          onClose={() => setShowRewards(false)}
          onAddCoins={(amount) => {
            setStats((prev) => {
              const next = { ...prev, coins: prev.coins + amount };
              saveStats(next);
              return next;
            });
          }}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          achievements={achievements}
          onClose={() => setShowAchievements(false)}
          onClaimAchievement={handleClaimAchievement}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
          }}
          onResetSettings={() => {
            const defaults = loadSettings();
            setSettings(defaults);
            saveSettings(defaults);
          }}
          onOpenHowToPlay={() => {
            setShowSettings(false);
            setShowHowToPlay(true);
          }}
        />
      )}

      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}

      {showCustomChallenge && (
        <CustomizationChallengeModal
          currentBall={ball}
          onClose={() => setShowCustomChallenge(false)}
          onOpenStudio={() => {
            setShowCustomChallenge(false);
            setScreen('customize');
          }}
          onAddCoins={(amount) => {
            setStats((prev) => {
              const next = { ...prev, coins: prev.coins + amount };
              saveStats(next);
              return next;
            });
          }}
        />
      )}
    </div>
  );
}
