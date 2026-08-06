// AudioManager unit tests with proper Howler mocking

let mockPlay: jest.Mock<number, []>;
let mockStop: jest.Mock<void, [number?]>;
let mockRate: jest.Mock<void, [number, number?]>;
let mockMute: jest.Mock<void, [boolean]>;

// Mock Howler module before any import of AudioManager
jest.mock('howler', () => {
  // These mocks will be assigned to the outer scoped variables
  mockPlay = jest.fn(() => 1); // returns a fake sound id
  mockStop = jest.fn();
  mockRate = jest.fn();
  mockMute = jest.fn();
  const MockHowl = jest.fn().mockImplementation(() => ({
    play: mockPlay,
    stop: mockStop,
    rate: mockRate,
  }));
  const MockHowler = { mute: mockMute };
  return { __esModule: true, Howl: MockHowl, Howler: MockHowler };
});

describe('AudioManager', () => {
  let audioManager: any;
  let Howl: any;
  let Howler: any;

  beforeEach(() => {
    // Ensure a clean module registry and localStorage for each test
    jest.resetModules();
    localStorage.clear();
    // Re-import the mocked Howler module to get fresh mock constructors
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const howlerMock = require('howler');
    Howl = howlerMock.Howl as any;
    Howler = howlerMock.Howler as any;
    // Reset mock call counters
    jest.clearAllMocks();
    // Import AudioManager after the mock is in place
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { AudioManager } = require('./AudioManager');
    // Ensure a fresh instance (module reset already clears singleton)
    audioManager = AudioManager.getInstance();
  });

  test('initial mute state is read from PersistenceService/localStorage', () => {
    // Set persisted mute before importing AudioManager
    localStorage.setItem('pacman4_mute', 'true');
    // Re-import AudioManager to pick up persisted value
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { AudioManager } = require('./AudioManager');
    AudioManager.resetInstance();
    const manager = AudioManager.getInstance();
    expect(manager.isMuted()).toBe(true);
    expect(mockMute).toHaveBeenCalled();
    // Clear mock calls for subsequent tests
    jest.clearAllMocks();
  });

  test('toggleMute updates state and persists via Howler', () => {
    expect(audioManager.isMuted()).toBe(false);
    audioManager.toggleMute();
    expect(audioManager.isMuted()).toBe(true);
    expect(mockMute).toHaveBeenCalledWith(true);
    audioManager.toggleMute();
    expect(audioManager.isMuted()).toBe(false);
    expect(mockMute).toHaveBeenCalledWith(false);
  });

  test('playSiren starts looping siren and sets initial rate', () => {
    audioManager.setLevel(2);
    audioManager.playSiren();
    // One Howl instance per sound (8 sounds defined)
    expect(Howl.mock.calls.length).toBeGreaterThanOrEqual(8);
    expect(mockPlay).toHaveBeenCalled();
    expect(audioManager.getSirenId()).toBe(1);
    expect(mockRate).toHaveBeenCalledWith(1.2, 1);
  });

  test('setLevel updates siren playback rate when siren is playing', () => {
    audioManager.playSiren(); // level defaults to 0, rate should be 1
    const sirenInstance = (audioManager as any).sounds['siren'];
    expect(sirenInstance.rate).toHaveBeenCalledWith(1, 1);
    audioManager.setLevel(5);
    expect(sirenInstance.rate).toHaveBeenCalledWith(1 + 5 * 0.1, 1);
  });

  test('stopSiren stops the siren sound', () => {
    audioManager.playSiren();
    const sirenInstance = (Howl as jest.Mock).mock.instances[7] as any;
    audioManager.stopSiren();
    expect(sirenInstance.stop).toHaveBeenCalledWith(1);
    expect(audioManager.getSirenId()).toBeUndefined();
  });
});
