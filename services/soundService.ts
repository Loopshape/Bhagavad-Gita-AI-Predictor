
class SoundService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  playBell(freq: number = 440, duration: number = 0.5) {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playClick() {
    this.playBell(880, 0.1);
  }

  playTransition() {
    this.playBell(220, 1.0);
  }

  triggerHaptic(strength: number = 10) {
    if (navigator.vibrate) {
      navigator.vibrate(strength);
    }
  }
}

export const soundService = new SoundService();
