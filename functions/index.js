const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.checkAiAuthorization = onCall((request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const hardcodedUid = "stvQZeRyP4XNT3WSdqh41d2YTi53";
  const authorizedUid = process.env.VITE_AI_AUTHORIZED_UID || process.env.AI_AUTHORIZED_UID || hardcodedUid;

  return { isAuthorized: request.auth.uid === authorizedUid };
});

const fs = require("fs");
const path = require("path");
const vm = require("vm");

let moduleReadyPromise = null;
let edgeImpulseModule = null;

function initEdgeImpulse() {
  if (moduleReadyPromise) return moduleReadyPromise;

  const wasmPath = path.join(__dirname, "ai-model", "edge-impulse-standalone.wasm");
  const jsPath = path.join(__dirname, "ai-model", "edge-impulse-standalone.js");

  if (!fs.existsSync(wasmPath) || !fs.existsSync(jsPath)) {
    console.error("Model files not found. Ensure they are deployed in functions/ai-model/");
    return Promise.reject(new Error("Model files not found."));
  }

  const wasmBuffer = fs.readFileSync(wasmPath);
  const aiCode = fs.readFileSync(jsPath, "utf8");

  moduleReadyPromise = new Promise((resolve, reject) => {
    const context = {
      window: {},
      document: { currentScript: { src: "edge-impulse-standalone.js" } },
      console: console,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: setInterval,
      clearInterval: clearInterval,
      URL: URL,
      process: { browser: true },
      require: undefined,
      Module: {
        wasmBinary: wasmBuffer,
        onRuntimeInitialized: function () {
          try {
            context.Module.init();
            edgeImpulseModule = context.Module;
            resolve(context.Module);
          } catch (err) {
            reject(err);
          }
        },
      },
    };
    context.self = context.window;

    vm.createContext(context);
    vm.runInContext("var Module = Module || {};", context);
    vm.runInContext(aiCode, context);
  });

  return moduleReadyPromise;
}

// Pre-initialize on cold start
initEdgeImpulse().catch(err => {
  console.log("Pre-initialization of Edge Impulse failed. May be expected if model files not present at top-level require.");
});

async function runEdgeImpulseClassifier(features) {
  const Module = await initEdgeImpulse();

  const ptr = Module._malloc(features.length * 4);
  if (!ptr) throw new Error("Failed to allocate memory in WASM");

  for (let i = 0; i < features.length; i++) {
    Module.HEAPF32[ptr / 4 + i] = features[i];
  }

  const result = Module.run_classifier(ptr, features.length, false);
  const anomaly = result ? (result.anomaly || 0) : 0;

  Module._free(ptr);
  return anomaly;
}

exports.getAnomalyScore = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated.");
  }

  const hardcodedUid = "stvQZeRyP4XNT3WSdqh41d2YTi53";
  const authorizedUid = process.env.VITE_AI_AUTHORIZED_UID || process.env.AI_AUTHORIZED_UID || hardcodedUid;

  if (request.auth.uid !== authorizedUid) {
    throw new HttpsError("permission-denied", "User is not authorized for AI features.");
  }

  const features = request.data.features;
  if (!features || !Array.isArray(features) || features.length !== 3) {
    throw new HttpsError("invalid-argument", "Expected features array of length 3.");
  }

  try {
    const anomalyScore = await runEdgeImpulseClassifier(features);
    return { anomalyScore };
  } catch (error) {
    console.error("Error executing Edge Impulse classifier:", error);
    throw new HttpsError("internal", "Failed to compute anomaly score.");
  }
});
