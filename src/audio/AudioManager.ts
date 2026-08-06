// src/audio/AudioManager.ts
import { Howl, Howler } from 'howler';

/**
 * AudioManager is a thin wrapper around Howler.js providing a simple API for the game.
 * It loads required sound assets, plays them on demand, and manages the global mute state.
 * The mute state is persisted via PersistenceService.
 */
export class AudioManager {
  // ID of the currently playing siren sound (if any)
  private sirenId?: number;
  private static instance: AudioManager;
  private sounds: Record<string, Howl> = {};
  private muted: boolean = false;
  private currentLevel: number = 0;

  private constructor() {
    // Private to enforce singleton pattern
    this.loadSounds();
    // Initialize mute state from persisted setting if available
    // Lazy import to avoid circular dependency issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PersistenceService } = require('../services/PersistenceService');
    const persisted = PersistenceService.getMute();
    this.setMute(persisted);
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /** Load all sound assets using Howler */
  private loadSounds() {
    // In a real project these URLs would point to actual asset files.
    // For the purpose of this assignment we use placeholder URLs.
    const soundDefs: { [key: string]: string } = {
      dot: '/assets/sounds/dot.mp3',
      powerPellet: '/assets/sounds/power-pellet.mp3',
      ghostEat: '/assets/sounds/ghost-eat.mp3',
      death: '/assets/sounds/death.mp3',
      fruit: '/assets/sounds/fruit.mp3',
      extraLife: '/assets/sounds/extra-life.mp3',
      startUp: '/assets/sounds/start-up.mp3',
      siren: '/assets/sounds/siren.mp3',
    };

    Object.entries(soundDefs).forEach(([key, src]) => {
      const isSiren = key === 'siren';
      this.sounds[key] = new Howl({ src, preload: true, loop: isSiren });
    });
  }

  /** Play a sound by its key. If the sound does not exist, it is ignored. */
  public play(soundKey: string) {
    const sound = this.sounds[soundKey];
    if (!sound) {
      // eslint-disable-next-line no-console
      console.warn(`AudioManager: sound "${soundKey}" not found`);
      return;
    }
    if (!this.muted) {
      sound.play();
    }
  }

  /** Play the siren sound (looped). */
  public playSiren() {
    const siren = this.sounds['siren'];
    if (!siren) return;
    if (this.muted) return;
    // Play and store the sound id for later rate adjustments
    this.sirenId = siren.play();
    // Set initial rate based on current level
    this.updateSirenRate();
  }

  /** Stop the siren sound if playing */
  public stopSiren() {
    const siren = this.sounds['siren'];
    if (!siren || this.sirenId === undefined) return;
    siren.stop(this.sirenId);
    this.sirenId = undefined;
  }

  /** Update the siren playback rate based on current level */
  private updateSirenRate() {
    const siren = this.sounds['siren'];
    if (!siren || this.sirenId === undefined) return;
    const rate = 1 + this.currentLevel * 0.1; // simple linear increase
    siren.rate(rate, this.sirenId);
  }

  /** Set the current game level, adjusting siren pitch if playing */
  public setLevel(level: number) {
    this.currentLevel = level;
    this.updateSirenRate();
  }

  /** Set global mute state */
  public setMute(mute: boolean) {
    this.muted = mute;
    Howler.mute(mute);
    // Persist the setting
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PersistenceService } = require('../services/PersistenceService');
    PersistenceService.setMute(mute);
  }

  /** Toggle mute state */
  public toggleMute() {
    this.setMute(!this.muted);
  }

  /** Get current mute state */
  public getSirenId(): number | undefined {
    return this.sirenId;
  }

  public isMuted(): boolean {
    return this.muted;
  }
}

// Export a singleton instance for convenience
export const audioManager = AudioManager.getInstance();
