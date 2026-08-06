import { Howl, Howler } from 'howler';

// Mock Howler.js
jest.mock('howler', () => {
  const mockPlay = jest.fn(() => 1); // return sound id 1
  const mockStop = jest.fn();
  const mockRate = jest.fn();
  const MockHowl = jest.fn().mockImplementation(() => ({
    play: mockPlay,
    stop: mockStop,
    rate: mockRate,
  }));
  const MockHowler = { mute: jest.fn() };
  return { Howl: MockHowl, Howler: MockHowler };
});

describe('AudioManager', () => {
  let AudioManagerClass: any;
  let audioManager: any;

  beforeEach(() => {
    // Reset modules and localStorage before each test
    jest.resetModules();
    localStorage.clear();
    // Re-import after mocking
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('./AudioManager');
    AudioManagerClass = mod.AudioManager;
    audioManager = mod.audioManager;
  });

  test('initial mute state is read from PersistenceService/localStorage', () => {
    localStorage.setItem('pacman4_mute', 'true');
    // Re-import to pick up persisted value
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../src/audio/AudioManager');
    const manager = mod.audioManager;
    expect(manager.isMuted()).toBe(true);
    expect(Howler.mute).toHaveBeenCalledWith(true);
  });

  test('toggleMute updates state and persists via Howler', () => {
    // start unmuted
    expect(audioManager.isMuted()).toBe(false);
    audioManager.toggleMute();
    expect(audioManager.isMuted()).toBe(true);
    expect(Howler.mute).toHaveBeenCalledWith(true);
    // toggle back
    audioManager.toggleMute();
    expect(audioManager.isMuted()).toBe(false);
    expect(Howler.mute).toHaveBeenCalledWith(false);
  });

  test('playSiren starts looping siren and sets initial rate', () => {
    audioManager.setLevel(2);
    audioManager.playSiren();
    const mockHowlInstance = (Howl as jest.Mock).mock.results[0].value;
    expect(mockHowlInstance.play).toHaveBeenCalled();
    // sirenId should be stored (mockPlay returns 1)
    expect(audioManager.sirenId).toBe(1);
    // rate should be set based on level 2 => 1 + 0.2 = 1.2
    expect(mockHowlInstance.rate).toHaveBeenCalledWith(1.2, 1);
  });

  test('setLevel updates siren playback rate when siren is playing', () => {
    audioManager.playSiren(); // starts with level 0 => rate 1
    const mockHowlInstance = (Howl as jest.Mock).mock.results[0].value;
    expect(mockHowlInstance.rate).toHaveBeenCalledWith(1, 1);
    // Change level
    audioManager.setLevel(5);
    expect(mockHowlInstance.rate).toHaveBeenCalledWith(1 + 5 * 0.1, 1);
  });

  test('stopSiren stops the siren sound', () => {
    audioManager.playSiren();
    const mockHowlInstance = (Howl as jest.Mock).mock.results[0].value;
    audioManager.stopSiren();
    expect(mockHowlInstance.stop).toHaveBeenCalledWith(1);
    expect(audioManager.sirenId).toBeUndefined();
  });
});
