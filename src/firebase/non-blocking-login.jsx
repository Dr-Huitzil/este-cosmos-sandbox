'use client';
import {
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { AuthSystemError } from './errors';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance) {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch((error) => {
    console.error('[Non-Blocking Auth Error] Anonymous sign-in failed:', error);
    errorEmitter.emit(
      'auth-error',
      new AuthSystemError('Failed to establish anonymous uplink.')
    );
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance, email, password) {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error('[Non-Blocking Auth Error] Email sign-up failed:', error);
    errorEmitter.emit(
      'auth-error',
      new AuthSystemError('Failed to establish email/password uplink.')
    );
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance, email, password) {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error('[Non-Blocking Auth Error] Email sign-in failed:', error);
    errorEmitter.emit(
      'auth-error',
      new AuthSystemError('Failed to establish email/password uplink.')
    );
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
