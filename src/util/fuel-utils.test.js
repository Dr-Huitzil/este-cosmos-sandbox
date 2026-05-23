import { describe, it, expect } from 'vitest';
import { calculateDaysPassed } from './fuel-utils.jsx';

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
