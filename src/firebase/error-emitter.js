'use client';

/**
 * A generic pub/sub event emitter.
 */
function createEventEmitter() {
  const events = {};

  return {
    /**
     * Subscribe to an event.
     * @param {string} eventName The name of the event to subscribe to.
     * @param {function} callback The function to call when the event is emitted.
     */
    on(eventName, callback) {
      if (!events[eventName]) {
        events[eventName] = [];
      }
      events[eventName].push(callback);
    },

    /**
     * Unsubscribe from an event.
     * @param {string} eventName The name of the event to unsubscribe from.
     * @param {function} callback The specific callback to remove.
     */
    off(eventName, callback) {
      if (!events[eventName]) {
        return;
      }
      events[eventName] = events[eventName].filter(cb => cb !== callback);
    },

    /**
     * Publish an event to all subscribers.
     * @param {string} eventName The name of the event to emit.
     * @param {any} data The data payload.
     */
    emit(eventName, data) {
      if (!events[eventName]) {
        return;
      }
      events[eventName].forEach(callback => callback(data));
    },
  };
}

// Create and export a singleton instance of the emitter.
export const errorEmitter = createEventEmitter();
