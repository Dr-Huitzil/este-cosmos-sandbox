import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runEdgeImpulseClassifier } from './ai-model.js';

describe('runEdgeImpulseClassifier', () => {
  let originalConsoleError;

  beforeEach(() => {
    // Suppress console.error in tests
    originalConsoleError = console.error;
    console.error = vi.fn();

    // Setup window.Module to be resolved by initEdgeImpulse.
    // We only create it once to avoid issues with the cached moduleReadyPromise
    // in initEdgeImpulse across tests.
    if (!window.Module) {
      window.Module = {
        run_classifier: vi.fn(),
        _malloc: vi.fn(),
        _free: vi.fn(),
        HEAPF32: new Float32Array(100),
        init: vi.fn()
      };
    } else {
      window.Module.run_classifier.mockReset();
      window.Module._malloc.mockReset();
      window.Module._free.mockReset();
      window.Module.init.mockReset();
    }
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should return default { anomaly: 0 } when memory allocation fails', async () => {
    // Fail memory allocation
    window.Module._malloc.mockReturnValue(0);

    const result = await runEdgeImpulseClassifier([1, 2, 3]);

    expect(result).toEqual({ anomaly: 0 });
    expect(console.error).toHaveBeenCalledWith(
      "Error executing Edge Impulse classifier:",
      expect.any(Error)
    );
    expect(window.Module._malloc).toHaveBeenCalledWith(12); // 3 features * 4 bytes
  });

  it('should return default { anomaly: 0 } when classification throws an exception', async () => {
    // Succeed memory allocation
    window.Module._malloc.mockReturnValue(4);
    // Throw error during classification
    window.Module.run_classifier.mockImplementation(() => {
      throw new Error("Classification failed");
    });

    const result = await runEdgeImpulseClassifier([1, 2, 3]);

    expect(result).toEqual({ anomaly: 0 });
    expect(console.error).toHaveBeenCalledWith(
      "Error executing Edge Impulse classifier:",
      expect.any(Error)
    );
    expect(window.Module._free).not.toHaveBeenCalled(); // Wait, if it throws before free, free might not be called. Actually in the code:
    // const result = Module.run_classifier(ptr, features.length, false);
    // Module._free(ptr);
    // So _free is indeed not called if run_classifier throws.
  });

  it('should return result from run_classifier on success', async () => {
    // Succeed memory allocation
    window.Module._malloc.mockReturnValue(4);
    // Return a mock result
    window.Module.run_classifier.mockReturnValue({ anomaly: 0.85 });

    // Module.HEAPF32 needs to be initialized. We already initialize it in beforeEach.

    const result = await runEdgeImpulseClassifier([1, 2, 3]);

    expect(result).toEqual({ anomaly: 0.85 });
    expect(window.Module._malloc).toHaveBeenCalledWith(12);
    expect(window.Module.run_classifier).toHaveBeenCalledWith(4, 3, false);
    expect(window.Module._free).toHaveBeenCalledWith(4);
    expect(console.error).not.toHaveBeenCalled();
  });
});
