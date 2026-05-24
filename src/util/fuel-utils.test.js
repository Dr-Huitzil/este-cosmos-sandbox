import { describe, it, expect } from 'vitest';
import { calculateDaysPassed, isSafePhotoURL } from './fuel-utils.jsx';

describe('calculateDaysPassed', () => {
  it('calculates 0 days for the same date', () => {
    expect(calculateDaysPassed('2024-01-01', '2024-01-01')).toBe(0);
  });

  it('calculates the correct difference for sequential dates', () => {
    expect(calculateDaysPassed('2024-01-05', '2024-01-01')).toBe(4);
  });

  it('returns the absolute difference if dates are in reverse order', () => {
    expect(calculateDaysPassed('2024-01-01', '2024-01-05')).toBe(4);
  });

  it('handles cross-month calculations correctly in leap years', () => {
    expect(calculateDaysPassed('2024-03-02', '2024-02-28')).toBe(3); // 2024 is a leap year
  });

  it('handles cross-month calculations correctly in non-leap years', () => {
    expect(calculateDaysPassed('2023-03-02', '2023-02-28')).toBe(2);
  });

  it('handles cross-year calculations correctly', () => {
    expect(calculateDaysPassed('2024-01-02', '2023-12-30')).toBe(3);
  });

  it('returns NaN for invalid date strings', () => {
    expect(calculateDaysPassed('invalid', '2024-01-01')).toBeNaN();
    expect(calculateDaysPassed('2024-01-01', 'invalid')).toBeNaN();
    expect(calculateDaysPassed('invalid', 'invalid')).toBeNaN();
  });

  it('returns NaN when arguments are missing or undefined', () => {
    expect(calculateDaysPassed(undefined, '2024-01-01')).toBeNaN();
    expect(calculateDaysPassed('2024-01-01', undefined)).toBeNaN();
    expect(calculateDaysPassed()).toBeNaN();
  });

  it('returns NaN for empty string arguments', () => {
    expect(calculateDaysPassed('', '2024-01-01')).toBeNaN();
    expect(calculateDaysPassed('2024-01-01', '')).toBeNaN();
  });

  it('calculates days from epoch (1970-01-01) for null arguments', () => {
    // new Date(null) resolves to 1970-01-01T00:00:00.000Z
    const expected = Math.floor(Math.abs(new Date(null) - new Date('2024-01-01')) / (1000 * 60 * 60 * 24));
    expect(calculateDaysPassed(null, '2024-01-01')).toBe(expected);
  });
});

describe('isSafePhotoURL', () => {
  it('returns false for falsy values', () => {
    expect(isSafePhotoURL(null)).toBe(false);
    expect(isSafePhotoURL(undefined)).toBe(false);
    expect(isSafePhotoURL('')).toBe(false);
  });

  it('returns true for safe URLs (HTTPS, allowed domains)', () => {
    expect(isSafePhotoURL('https://something.google.com/photo.jpg')).toBe(true);
    expect(isSafePhotoURL('https://lh3.googleusercontent.com/a/some-id')).toBe(true);
    expect(isSafePhotoURL('https://api.googleapis.com/photo.jpg')).toBe(true);
    expect(isSafePhotoURL('https://avatars.githubusercontent.com/u/123')).toBe(true);
  });

  it('returns false for unsafe protocols (HTTP)', () => {
    expect(isSafePhotoURL('http://google.com/photo.jpg')).toBe(false);
    expect(isSafePhotoURL('http://lh3.googleusercontent.com/a/some-id')).toBe(false);
  });

  it('returns false for unsafe domains', () => {
    expect(isSafePhotoURL('https://example.com/photo.jpg')).toBe(false);
    expect(isSafePhotoURL('https://malicious-site.com/avatar')).toBe(false);
    // Domain should end with the allowed string, not just contain it
    expect(isSafePhotoURL('https://googleusercontent.com.malicious.com/a')).toBe(false);
  });

  it('returns false for malformed URL strings (error path)', () => {
    expect(isSafePhotoURL('not a url')).toBe(false);
    expect(isSafePhotoURL('://bad-url')).toBe(false);
    expect(isSafePhotoURL('http://')).toBe(false);
    expect(isSafePhotoURL('just a string')).toBe(false);
  });
});
