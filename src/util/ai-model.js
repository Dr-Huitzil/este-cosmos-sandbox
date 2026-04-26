/**
 * Helper to run the Edge Impulse WebAssembly ML model for Anomaly Detection
 */

// A promise that resolves when the WASM module is fully loaded
let moduleReadyPromise = null;

export const initEdgeImpulse = () => {
  if (moduleReadyPromise) return moduleReadyPromise;

  moduleReadyPromise = new Promise((resolve, reject) => {
    // Check if Module is already loaded and initialized
    if (window.Module && window.Module.run_classifier) {
      resolve(window.Module);
      return;
    }

    if (!window.Module) {
      window.Module = {};
    }

    // Hook into the onRuntimeInitialized callback
    const originalOnRuntimeInitialized = window.Module.onRuntimeInitialized;
    window.Module.onRuntimeInitialized = () => {
      if (originalOnRuntimeInitialized) originalOnRuntimeInitialized();
      
      try {
        window.Module.init(); // Initialize the classifier
        resolve(window.Module);
      } catch (err) {
        console.error("Failed to initialize Edge Impulse model:", err);
        reject(err);
      }
    };
  });

  return moduleReadyPromise;
};

/**
 * Runs the anomaly detection classifier.
 * @param {number[]} features - Array of floats: [mpg, fuelQuantity, miles_per_day]
 * @returns {Promise<{ anomaly: number }>}
 */
export const runEdgeImpulseClassifier = async (features) => {
  try {
    const Module = await initEdgeImpulse();

    // Allocate memory in WASM heap
    const ptr = Module._malloc(features.length * 4); // 4 bytes per float32
    if (!ptr) throw new Error("Failed to allocate memory in WASM");

    // Copy features into the WASM heap
    for (let i = 0; i < features.length; i++) {
      Module.HEAPF32[ptr / 4 + i] = features[i];
    }

    // run_classifier expects (data_ptr, data_length, debug)
    const result = Module.run_classifier(ptr, features.length, false);

    // Free the allocated memory
    Module._free(ptr);

    if (result) {
      return {
        anomaly: result.anomaly || 0,
        // Optional: Include the bounding_boxes or full classification map if needed
      };
    }
    
    return { anomaly: 0 };
  } catch (error) {
    console.error("Error executing Edge Impulse classifier:", error);
    // Return a safe default to prevent crashing
    return { anomaly: 0 };
  }
};
