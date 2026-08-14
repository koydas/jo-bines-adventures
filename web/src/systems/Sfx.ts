/**
 * Combat sound effects, synthesized on the fly via the Web Audio API.
 *
 * Neither the legacy GameMaker project nor this port ever shipped any
 * audio assets (no sounds/ folder, nothing loaded in BootScene) — there
 * was nothing to port. Rather than source/bundle sample files, these are
 * short procedural blips/noise bursts (oscillator tones + white-noise
 * envelopes), which needs no asset pipeline and stays tiny.
 *
 * The AudioContext is created lazily on first use and resumed if
 * suspended, since browsers block audio until a user gesture — by the
 * time any of these fire (a punch, a hit), the player has already tapped
 * to start the game, so this always finds it already unlocked.
 */
class SfxSystem {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, duration: number, type: OscillatorType, volume: number, delay = 0) {
    const ctx = this.getContext();
    if (!ctx) return;
    const start = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  }

  private noiseBurst(duration: number, volume: number) {
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    noise.connect(gain).connect(ctx.destination);
    noise.start();
  }

  /** Player.punch() swinging — a short sharp blip, whether or not it connects. */
  punch() {
    this.tone(220, 0.07, "square", 0.12);
  }

  /** A skeleton starting its attack swing — lower-pitched than the player's punch for contrast. */
  skeletonAttack() {
    this.tone(140, 0.09, "square", 0.1);
  }

  /** Landing on flesh/bone — noise burst + a low thump, used for both the player and skeletons taking damage. */
  hit() {
    this.noiseBurst(0.12, 0.18);
    this.tone(110, 0.15, "sawtooth", 0.12);
  }

  /** A skeleton's death — quick descending two-note sting. */
  skeletonDeath() {
    this.tone(320, 0.06, "square", 0.12);
    this.tone(140, 0.22, "sawtooth", 0.1, 0.05);
  }
}

export const sfx = new SfxSystem();
