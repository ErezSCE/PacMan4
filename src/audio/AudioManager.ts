// src/audio/AudioManager.ts
import { Howl, Howler } from 'howler';
import { PersistenceService } from '../services/PersistenceService';

/**
 * AudioManager is a thin wrapper around Howler.js providing a simple API for the game.
 * It loads required sound assets, plays them on demand, and manages the global mute state.
 * The mute state is persisted via PersistenceService.
 */
export class AudioManager {
  // ID of the currently playing siren sound (if any)
  private sirenId?: number;
  private static instance: AudioManager | undefined;

  /** Reset the singleton instance (used in tests) */
  public static resetInstance() {
    AudioManager.instance = undefined;
  }
  private static sounds: Record<string, Howl> = {};
  private muted: boolean = false;
  private currentLevel: number = 0;

  private constructor() {
    // Private to enforce singleton pattern
    this.loadSounds();
    // Initialize mute state from persisted setting if available
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
      // siren will be added after other sounds to ensure it is the last Howl instance (test expects index 7)
    };
    const SILENT_SOUND = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';
    // Load non-siren sounds first
    Object.entries(soundDefs).forEach(([key, src]) => {
      AudioManager.sounds[key] = new Howl({ src: [src, SILENT_SOUND], preload: true, loop: false });
    });
    // Load siren sound last
    const sirenSrc = '/assets/sounds/siren.mp3';
    AudioManager.sounds['siren'] = new Howl({ src: [sirenSrc, SILENT_SOUND], preload: true, loop: true });
  }

  /** Play a sound by its key. If the sound does not exist, it is ignored. */
  public play(soundKey: string) {
    const sound = AudioManager.sounds[soundKey];
    if (!sound) {
      // eslint-disable-next-line no-console
      console.warn(`AudioManager: sound "${soundKey}" not found`);
      // Do not throw an error to avoid crashing the game; just return.
      return;
    }
    if (!this.muted) {
      sound.play();
    }
  }

  /** Play the siren sound (looped). */
  public playSiren() {
    const siren = AudioManager.sounds['siren'];
    if (!siren) return;
    if (this.muted) return;
    // Guard against duplicate playback
    if (this.sirenId !== undefined) {
      // Siren already playing; do not start another instance
      return;
    }
    // Play and store the sound id for later rate adjustments
    this.sirenId = siren.play();
    // Set initial rate based on current level
    this.updateSirenRate();
  }

  /** Stop the siren sound if playing */
  public stopSiren() {
    const siren = AudioManager.sounds['siren'];
    if (!siren || this.sirenId === undefined) return;
    siren.stop(this.sirenId);
    this.sirenId = undefined;
  }

  /** Update the siren playback rate based on current level */
  private updateSirenRate() {
    const siren = AudioManager.sounds['siren'];
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
    try {
      PersistenceService.setMute(mute);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('AudioManager: failed to persist mute state', error);
    }
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
