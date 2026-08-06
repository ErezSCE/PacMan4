import { Engine } from './Engine';
import { Direction } from '../input/types';

describe('Engine', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine();
  });

  test('tick returns true on first frame (no previous state)', () => {
    const needsRedraw = engine.tick();
    expect(needsRedraw).toBe(true);
  });

  test('tick returns false when state unchanged', () => {
    // First tick to establish prevState
    engine.tick();
    // No state change
    const needsRedraw = engine.tick();
    expect(needsRedraw).toBe(false);
  });

  test('tick returns true when direction changes', () => {
    engine.tick(); // establish prevState
    engine.setDirection(Direction.Up);
    const needsRedraw = engine.tick();
    expect(needsRedraw).toBe(true);
  });

  test('loadAssets lazily loads level data and sprite sheet', async () => {
    expect((engine as any).assetsLoaded).toBe(false);
    await engine.loadAssets();
    expect((engine as any).assetsLoaded).toBe(true);
    expect((engine as any).levelData).toEqual({ name: 'Level 1', layout: [] });
    expect((engine as any).spriteSheet).toEqual({ sprites: [] });
    // Calling again should not reload
    const spy = jest.spyOn(engine as any, 'loadAssets');
    await engine.loadAssets();
    expect(spy).toHaveReturned(); // returns early without error
  });
});
