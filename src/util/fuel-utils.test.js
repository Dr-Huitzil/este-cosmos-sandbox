import { describe, it, expect } from 'vitest';
import { calculateDaysPassed, isSafePhotoURL } from './fuel-utils.jsx';

import { calculateMPG } from './fuel-utils.jsx';

describe('calculateMPG', () => {
  it('returns 0 if the current entry is not a full fill-up', () => {
    const currentEntry = { odometer: 1000, fuelQuantity: 10, isFull: false };
    const sortedEntries = [currentEntry];
    expect(calculateMPG(currentEntry, sortedEntries)).toBe(0);
  });

  it('calculates MPG correctly for sequential full fill-ups', () => {
    // Note: sortedEntries must be sorted newest first (highest odometer first)
    const entry1 = { odometer: 1000, fuelQuantity: 10, isFull: true };
    const entry2 = { odometer: 1300, fuelQuantity: 15, isFull: true };
    const sortedEntries = [entry2, entry1];

    // Distance = 1300 - 1000 = 300
    // Total fuel = 15
    // MPG = 300 / 15 = 20
    expect(calculateMPG(entry2, sortedEntries)).toBe(20);
  });

  it('calculates MPG correctly by including partial fill-ups up to the previous full fill-up', () => {
    const entry1 = { odometer: 1000, fuelQuantity: 10, isFull: true };
    const entry2 = { odometer: 1100, fuelQuantity: 5, isFull: false }; // partial
    const entry3 = { odometer: 1200, fuelQuantity: 5, isFull: false }; // partial
    const entry4 = { odometer: 1400, fuelQuantity: 10, isFull: true };
    const sortedEntries = [entry4, entry3, entry2, entry1];

    // Distance = 1400 - 1000 = 400
    // Total fuel = 10 (entry4) + 5 (entry3) + 5 (entry2) = 20
    // MPG = 400 / 20 = 20
    expect(calculateMPG(entry4, sortedEntries)).toBe(20);
  });

  it('returns 0 if there is no previous full fill-up', () => {
    const entry1 = { odometer: 1000, fuelQuantity: 10, isFull: false };
    const entry2 = { odometer: 1100, fuelQuantity: 5, isFull: false };
    const entry3 = { odometer: 1400, fuelQuantity: 10, isFull: true };
    const sortedEntries = [entry3, entry2, entry1];

    expect(calculateMPG(entry3, sortedEntries)).toBe(0);
  });

  it('returns 0 if the distance is 0 or negative', () => {
    const entry1 = { odometer: 1000, fuelQuantity: 10, isFull: true };
    const entry2 = { odometer: 1000, fuelQuantity: 15, isFull: true };
    const sortedEntries = [entry2, entry1];

    expect(calculateMPG(entry2, sortedEntries)).toBe(0);
  });
});

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
