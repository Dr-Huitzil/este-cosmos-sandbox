import { describe, it, expect, vi } from 'vitest';
import { errorEmitter } from './error-emitter.js';

describe('errorEmitter', () => {
  it('registers a listener and emits an event', () => {
    const callback = vi.fn();
    const eventName = 'test-event';
    const payload = { message: 'test message' };

    errorEmitter.on(eventName, callback);
    errorEmitter.emit(eventName, payload);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(payload);

    // cleanup
    errorEmitter.off(eventName, callback);
  });

  it('registers multiple listeners for the same event and calls all of them', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const eventName = 'test-multiple-event';
    const payload = { message: 'test message' };

    errorEmitter.on(eventName, callback1);
    errorEmitter.on(eventName, callback2);
    errorEmitter.emit(eventName, payload);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledWith(payload);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledWith(payload);

    // cleanup
    errorEmitter.off(eventName, callback1);
    errorEmitter.off(eventName, callback2);
  });

  it('removes a listener so it is not called upon emit', () => {
    const callback = vi.fn();
    const eventName = 'test-off-event';
    const payload = { message: 'test message' };

    errorEmitter.on(eventName, callback);
    errorEmitter.off(eventName, callback);
    errorEmitter.emit(eventName, payload);

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not throw when removing a listener from an unregistered event', () => {
    const callback = vi.fn();
    const eventName = 'unregistered-off-event';

    expect(() => {
      errorEmitter.off(eventName, callback);
    }).not.toThrow();
  });

  it('does not throw when emitting an unregistered event', () => {
    const eventName = 'unregistered-emit-event';
    const payload = { message: 'test message' };

    expect(() => {
      errorEmitter.emit(eventName, payload);
    }).not.toThrow();
  });
});
