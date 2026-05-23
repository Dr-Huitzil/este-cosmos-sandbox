import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from './non-blocking-updates';
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// Mock dependencies
vi.mock('firebase/firestore', () => ({
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

vi.mock('@/firebase/error-emitter', () => ({
  errorEmitter: {
    emit: vi.fn(),
  },
}));

// Mock errors so we can check instanceof without relying on full implementation if it changes
vi.mock('@/firebase/errors', () => {
  class MockFirestorePermissionError extends Error {
    constructor(args) {
      super('MockError');
      this.name = 'FirestorePermissionError';
      this.args = args;
    }
  }
  return {
    FirestorePermissionError: MockFirestorePermissionError,
  };
});

describe('Non-Blocking Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Stub console.error to avoid noise in the test output,
    // as the snippet suggests console.error might be used
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('setDocumentNonBlocking', () => {
    it('should call setDoc with correct arguments and not throw on success', async () => {
      const docRef = { path: 'test/doc' };
      const data = { foo: 'bar' };
      const options = { merge: true };

      setDoc.mockResolvedValueOnce(undefined);

      setDocumentNonBlocking(docRef, data, options);

      expect(setDoc).toHaveBeenCalledWith(docRef, data, options);

      // Wait a microtask to ensure any rejected promises are handled
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(errorEmitter.emit).not.toHaveBeenCalled();
    });

    it('should emit a permission error if setDoc fails', async () => {
      const docRef = { path: 'test/doc' };
      const data = { foo: 'bar' };
      const error = new Error('Permission denied');

      setDoc.mockRejectedValueOnce(error);

      setDocumentNonBlocking(docRef, data);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(errorEmitter.emit).toHaveBeenCalledWith(
        'permission-error',
        expect.any(FirestorePermissionError)
      );
    });
  });

  describe('addDocumentNonBlocking', () => {
    it('should call addDoc and return a promise that resolves on success', async () => {
      const colRef = { path: 'test' };
      const data = { foo: 'bar' };
      const newDocRef = { id: 'new-doc' };

      addDoc.mockResolvedValueOnce(newDocRef);

      const promise = addDocumentNonBlocking(colRef, data);

      expect(addDoc).toHaveBeenCalledWith(colRef, data);
      await expect(promise).resolves.toBe(newDocRef);
      expect(errorEmitter.emit).not.toHaveBeenCalled();
    });

    it('should emit a permission error and rethrow the error if addDoc fails', async () => {
      const colRef = { path: 'test' };
      const data = { foo: 'bar' };
      const error = new Error('Permission denied');

      addDoc.mockRejectedValueOnce(error);

      const promise = addDocumentNonBlocking(colRef, data);

      await expect(promise).rejects.toThrow('Permission denied');

      expect(errorEmitter.emit).toHaveBeenCalledWith(
        'permission-error',
        expect.any(FirestorePermissionError)
      );
    });
  });

  describe('updateDocumentNonBlocking', () => {
    it('should call updateDoc and not throw on success', async () => {
      const docRef = { path: 'test/doc' };
      const data = { foo: 'baz' };

      updateDoc.mockResolvedValueOnce(undefined);

      updateDocumentNonBlocking(docRef, data);

      expect(updateDoc).toHaveBeenCalledWith(docRef, data);

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(errorEmitter.emit).not.toHaveBeenCalled();
    });

    it('should emit a permission error if updateDoc fails', async () => {
      const docRef = { path: 'test/doc' };
      const data = { foo: 'baz' };
      const error = new Error('Permission denied');

      updateDoc.mockRejectedValueOnce(error);

      updateDocumentNonBlocking(docRef, data);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(errorEmitter.emit).toHaveBeenCalledWith(
        'permission-error',
        expect.any(FirestorePermissionError)
      );
    });
  });

  describe('deleteDocumentNonBlocking', () => {
    it('should call deleteDoc and not throw on success', async () => {
      const docRef = { path: 'test/doc' };

      deleteDoc.mockResolvedValueOnce(undefined);

      deleteDocumentNonBlocking(docRef);

      expect(deleteDoc).toHaveBeenCalledWith(docRef);

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(errorEmitter.emit).not.toHaveBeenCalled();
    });

    it('should emit a permission error if deleteDoc fails', async () => {
      const docRef = { path: 'test/doc' };
      const error = new Error('Permission denied');

      deleteDoc.mockRejectedValueOnce(error);

      deleteDocumentNonBlocking(docRef);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(errorEmitter.emit).toHaveBeenCalledWith(
        'permission-error',
        expect.any(FirestorePermissionError)
      );
    });
  });
});
