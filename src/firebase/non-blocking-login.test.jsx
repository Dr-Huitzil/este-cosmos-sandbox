import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  initiateAnonymousSignIn,
  initiateEmailSignUp,
  initiateEmailSignIn,
} from './non-blocking-login';
import {
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { AuthSystemError } from './errors';

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  signInAnonymously: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
}));

// Mock error emitter and console.error
vi.mock('./error-emitter', () => {
  return {
    errorEmitter: {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    },
  };
});

describe('Non-blocking Auth Operations', () => {
  const mockAuthInstance = {}; // Dummy object for auth

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('initiateAnonymousSignIn', () => {
    it('should call signInAnonymously', () => {
      signInAnonymously.mockReturnValue(Promise.resolve());
      initiateAnonymousSignIn(mockAuthInstance);
      expect(signInAnonymously).toHaveBeenCalledWith(mockAuthInstance);
      expect(signInAnonymously).toHaveBeenCalledTimes(1);
    });

    it('should emit auth-error and log to console on failure', async () => {
      const mockError = new Error('Auth failed');
      signInAnonymously.mockReturnValue(Promise.reject(mockError));

      initiateAnonymousSignIn(mockAuthInstance);

      // Wait for promise resolution (the catch block execution)
      await Promise.resolve();

      expect(console.error).toHaveBeenCalledWith('[Non-Blocking Auth Error] Anonymous sign-in failed:', mockError);
      expect(errorEmitter.emit).toHaveBeenCalledWith(
        'auth-error',
        expect.any(AuthSystemError)
      );

      // Check that the error emitted is correct
      const emittedError = errorEmitter.emit.mock.calls[0][1];
      expect(emittedError.message).toBe('Failed to establish anonymous uplink.');
    });
  });

  describe('initiateEmailSignUp', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should call createUserWithEmailAndPassword', () => {
      createUserWithEmailAndPassword.mockReturnValue(Promise.resolve());
      initiateEmailSignUp(mockAuthInstance, email, password);
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuthInstance, email, password);
      expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it('should emit auth-error and log to console on failure', async () => {
      const mockError = new Error('Sign up failed');
      createUserWithEmailAndPassword.mockReturnValue(Promise.reject(mockError));

      initiateEmailSignUp(mockAuthInstance, email, password);

      await Promise.resolve();

      expect(console.error).toHaveBeenCalledWith('[Non-Blocking Auth Error] Email sign-up failed:', mockError);
      expect(errorEmitter.emit).toHaveBeenCalledWith(
        'auth-error',
        expect.any(AuthSystemError)
      );

      const emittedError = errorEmitter.emit.mock.calls[0][1];
      expect(emittedError.message).toBe('Failed to establish email/password uplink.');
    });
  });

  describe('initiateEmailSignIn', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should call signInWithEmailAndPassword', () => {
      signInWithEmailAndPassword.mockReturnValue(Promise.resolve());
      initiateEmailSignIn(mockAuthInstance, email, password);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuthInstance, email, password);
      expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    });

    it('should emit auth-error and log to console on failure', async () => {
      const mockError = new Error('Sign in failed');
      signInWithEmailAndPassword.mockReturnValue(Promise.reject(mockError));

      initiateEmailSignIn(mockAuthInstance, email, password);

      await Promise.resolve();

      expect(console.error).toHaveBeenCalledWith('[Non-Blocking Auth Error] Email sign-in failed:', mockError);
      expect(errorEmitter.emit).toHaveBeenCalledWith(
        'auth-error',
        expect.any(AuthSystemError)
      );

      const emittedError = errorEmitter.emit.mock.calls[0][1];
      expect(emittedError.message).toBe('Failed to establish email/password uplink.');
    });
  });
});
