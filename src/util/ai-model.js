/**
 * Note: Local execution of the Edge Impulse model has been moved to Firebase Cloud Functions
 * for security reasons. The functions in this file are no longer used by the client.
 */

export const initEdgeImpulse = () => {
  return Promise.resolve(null);
};

export const runEdgeImpulseClassifier = async () => {
  return { anomaly: 0 };
};
