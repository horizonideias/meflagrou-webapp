class AmbientSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentMode: 'club' | 'sunset' | 'lounge' | null = null;
  private nodes: (AudioNode | number)[] = [];
  public volume: number = 0.25;

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public stop() {
    this.nodes.forEach((item) => {
      if (typeof item === 'number') {
        clearInterval(item);
      } else {
        try {
          if ('stop' in item && typeof (item as AudioScheduledSourceNode).stop === 'function') {
            (item as AudioScheduledSourceNode).stop();
          }
          item.disconnect();
        } catch {
          // ignore
        }
      }
    });
    this.nodes = [];
    this.isPlaying = false;
    this.currentMode = null;
  }

  public playMode(mode: 'club' | 'sunset' | 'lounge') {
    if (this.isPlaying && this.currentMode === mode) {
      this.stop();
      return false;
    }

    this.stop();
    const ctx = this.initContext();
    if (!ctx) return false;

    this.isPlaying = true;
    this.currentMode = mode;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.nodes.push(masterGain);

    if (mode === 'club') {
      // 1. Muffled Sub-Bass 4-on-the-floor beat
      const intervalId = window.setInterval(() => {
        if (!this.ctx || !this.isPlaying) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(140, this.ctx.currentTime);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(55, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.2);

          gain.gain.setValueAtTime(0.7, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.35);
        } catch {
          // ignore
        }
      }, 500); // 120 BPM
      this.nodes.push(intervalId);

      // Low drone pad
      const droneOsc = ctx.createOscillator();
      const droneGain = ctx.createGain();
      droneOsc.type = 'sawtooth';
      droneOsc.frequency.setValueAtTime(110, ctx.currentTime);
      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(200, ctx.currentTime);
      droneGain.gain.setValueAtTime(0.08, ctx.currentTime);

      droneOsc.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(masterGain);
      droneOsc.start();
      this.nodes.push(droneOsc);

    } else if (mode === 'sunset') {
      // Warm ocean breeze + harmonic chord
      const chords = [220, 277.18, 329.63, 440]; // A major 7
      chords.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        this.nodes.push(osc);
      });

    } else {
      // Lounge / Jazz soft chords
      const chords = [174.61, 220.00, 261.63, 329.63]; // Fmaj7
      chords.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        this.nodes.push(osc);
      });
    }

    return true;
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentMode: this.currentMode,
    };
  }
}

export const ambientSound = new AmbientSoundscapeEngine();
