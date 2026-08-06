import { AudioManager } from './AudioManager';

let mockPlay: jest.Mock<number, []>;
let mockStop: jest.Mock<void, [number?]>;
let mockRate: jest.Mock<void, [number, number?]>;

type MockHowlInstance = {
  play: jest.Mock<number, []>;
  stop: jest.Mock<void, [number?]>;
  rate: jest.Mock<void, [number, number?]>;
};

type MockHowlClass = jest.MockedClass<new (options: any) => MockHowlInstance>;

type MockHowler = { mute: jest.Mock<void, [boolean]> };

let Howl: MockHowlClass;
let Howler: MockHowler;

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    // Reset modules and localStorage before each test
    jest.resetModules();
    localStorage.clear();
    // Mock Howler.js for this test scope
    jest.doMock('howler', () => {
      const mockPlay = jest.fn(() => 1); // return sound id 1
      const mockStop = jest.fn();
      const mockRate = jest.fn((rate: number, id?: number) => {});
      const MockHowl = jest.fn().mockImplementation(() => ({
        play: mockPlay,
        stop: mockStop,
        rate: mockRate,
      }));
      const MockHowler = { mute: jest.fn() };
      return { Howl: MockHowl, Howler: MockHowler };
    });
    // Re-import after mocking
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { AudioManager, audioManager: importedManager } = require('./AudioManager');
    // Ensure singleton is reset (in case previous instance persisted)
    AudioManager.resetInstance();
    // Get fresh instance
    audioManager = AudioManager.getInstance();
    // Assign mocked Howl/Howler for later assertions
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const howlerMock = require('howler');
    Howl = howlerMock.Howl as any;
    Howl.mockClear && Howl.mockClear();
    Howler = howlerMock.Howler as any;
  });

  test('initial mute state is read from PersistenceService/localStorage', () => {
    localStorage.setItem('pacman4_mute', 'true');
    // Re-import to pick up persisted value
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('./AudioManager');
    const manager = mod.audioManager;
    expect(manager.isMuted()).toBe(true);
    expect(Howler.mute).toHaveBeenCalled();
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
    // Verify Howl was instantiated for each sound
    expect(Howl).toHaveBeenCalledTimes(8);
    // Ensure play was called
    expect(mockPlay).toHaveBeenCalled();
    // sirenId should be stored (mockPlay returns 1)
    expect(audioManager.getSirenId()).toBe(1);
    // rate should be set based on level 2 => 1 + 0.2 = 1.2
    expect(mockRate).toHaveBeenCalledWith(1.2, 1);
  });

  test('setLevel updates siren playback rate when siren is playing', () => {
    audioManager.playSiren(); // starts with level 0 => rate 1
    const sirenInstance = (Howl as jest.Mock).mock.instances[7] as any;
    expect(sirenInstance.rate).toHaveBeenCalledWith(1, 1);
    // Change level
    audioManager.setLevel(5);
    expect(sirenInstance.rate).toHaveBeenCalledWith(1 + 5 * 0.1, 1);
  });

  test('stopSiren stops the siren sound', () => {
    audioManager.playSiren();
    const mockHowlInstance = (Howl as jest.Mock).mock.instances[7] as any;
    audioManager.stopSiren();
    expect(mockHowlInstance.stop).toHaveBeenCalledWith(1);
    expect(audioManager.getSirenId()).toBeUndefined();
  });
});
