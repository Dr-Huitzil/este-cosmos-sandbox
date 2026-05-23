import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ai-model', () => {
  let aiModel;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal('window', {});
    // Dynamically import to get a fresh instance of the module state
    aiModel = await import('./ai-model.js');
  });

  it('resolves immediately if already loaded and initialized', async () => {
    window.Module = { run_classifier: vi.fn() };
    const result = await aiModel.initEdgeImpulse();
    expect(result).toBe(window.Module);
  });

  it('rejects if initialization throws an error', async () => {
    // Don't define run_classifier so it goes into the promise constructor
    // but the actual execution happens in onRuntimeInitialized
    const promise = aiModel.initEdgeImpulse();

    // Now window.Module is initialized as {}
    // and onRuntimeInitialized is assigned

    const mockError = new Error('Init failed');
    window.Module.init = vi.fn().mockImplementation(() => {
      throw mockError;
    });

    // We also want to suppress console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // trigger onRuntimeInitialized
    window.Module.onRuntimeInitialized();

    await expect(promise).rejects.toThrow('Init failed');

    expect(consoleSpy).toHaveBeenCalledWith("Failed to initialize Edge Impulse model:", mockError);

    consoleSpy.mockRestore();
  });
});
