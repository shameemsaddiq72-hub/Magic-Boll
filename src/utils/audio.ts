/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio API sound generator
class SoundSystem {
  private ctx: AudioContext | null = null;
  private musicOsc: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying = false;
  private timerId: number | null = null;

  private masterVol = 0.8;
  private musicVol = 0.5;
  private sfxVol = 0.7;
  private isMuted = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolumes(master: number, music: number, sfx: number, muted: boolean) {
    this.masterVol = master;
    this.musicVol = music;
    this.sfxVol = sfx;
    this.isMuted = muted;

    if (this.musicGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.masterVol * this.musicVol * 0.15;
      this.musicGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
  }

  // SFX: Play short synthesized notes
  public playSfx(type: 'jump' | 'bounce' | 'collect' | 'star' | 'hit' | 'win' | 'click' | 'change' | 'whoosh') {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const baseGain = this.masterVol * this.sfxVol * 0.25;

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      switch (type) {
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
          gain.gain.setValueAtTime(baseGain * 0.5, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;

        case 'change':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
          gain.gain.setValueAtTime(baseGain * 0.6, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.09);
          osc.start(now);
          osc.stop(now + 0.09);
          break;

        case 'bounce':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(360, now + 0.06);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
          gain.gain.setValueAtTime(baseGain * 0.8, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;

        case 'jump':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(250, now);
          osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);
          gain.gain.setValueAtTime(baseGain * 0.7, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.16);
          osc.start(now);
          osc.stop(now + 0.16);
          break;

        case 'collect':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.setValueAtTime(880, now + 0.06); // A5
          gain.gain.setValueAtTime(baseGain * 0.7, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;

        case 'star':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
          osc.frequency.setValueAtTime(783.99, now + 0.12); // G5
          osc.frequency.setValueAtTime(1046.5, now + 0.18); // C6
          gain.gain.setValueAtTime(baseGain * 0.8, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;

        case 'hit':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.linearRampToValueAtTime(50, now + 0.15);
          gain.gain.setValueAtTime(baseGain * 0.9, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;

        case 'win':
          // celebratory arpeggio
          [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
            if (!this.ctx) return;
            const subOsc = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            subOsc.type = 'triangle';
            subOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
            subGain.gain.setValueAtTime(baseGain * 0.6, now + idx * 0.08);
            subGain.gain.linearRampToValueAtTime(0, now + idx * 0.08 + 0.25);
            subOsc.connect(subGain);
            subGain.connect(this.ctx.destination);
            subOsc.start(now + idx * 0.08);
            subOsc.stop(now + idx * 0.08 + 0.25);
          });
          break;

        case 'whoosh':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
          gain.gain.setValueAtTime(baseGain * 0.4, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Procedural Background Music Loop (Gentle arcade melody)
  public startMusic() {
    if (this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    const notes = [
      261.63, 329.63, 392.00, 523.25, // C E G C
      293.66, 349.23, 440.00, 587.33, // D F A D
      329.63, 392.00, 493.88, 659.25, // E G B E
      261.63, 392.00, 523.25, 659.25  // C G C E
    ];
    let noteIdx = 0;

    const playNext = () => {
      if (!this.isMusicPlaying || !this.ctx) return;
      if (!this.isMuted && this.musicVol > 0 && this.masterVol > 0) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[noteIdx % notes.length], now);

        const targetGain = this.masterVol * this.musicVol * 0.06;
        gain.gain.setValueAtTime(targetGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
      }
      noteIdx++;
      this.timerId = window.setTimeout(playNext, 380);
    };

    playNext();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggleMusic() {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }
}

export const sound = new SoundSystem();
