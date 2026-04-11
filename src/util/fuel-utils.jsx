/**
 * Calculates MPG for a given fuel entry considering partial fill-ups
 * MPG is only calculated on 'Full' fill-ups, representing efficiency
 * since the last 'full' fill-up
 *
 * @param {{ odometer: number, fuelQuantity: number, isFull: boolean}} currentEntry
 * @param {Array<{ odometer: number, fuelQuantity: number, isFull: boolean, day: string}>} allEntries
 * @returns {numbers}
 */

export function calculateMPG(currentEntry, allEntries) {
  if (!currentEntry.isFull) return 0;

  const sorted = [...allEntries].sort(
    (a, b) => new Date(b.day).getTime() - new Date(a.day).getTime(),
  );

  let totalFuel = currentEntry.fuelQuantity;
  let prevFullEntry = null;

  for (const entry of sorted) {
    if (entry.odometer >= currentEntry.odometer) continue;
    totalFuel += entry.fuelQuantity;
    if (entry.isFull) {
      prevFullEntry = entry;
      break;
    }
  }

  if (!prevFullEntry) return 0;

  const distance = currentEntry.odometer - prevFullEntry.odometer;
  if (distance <= 0) return 0;

  return Number((distance / totalFuel).toFixed(2));
}

/**
 * Formats a number to USD currency
 * @param {number} amount
 * @return {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Sorts fuel entries newest-first by day
 * @param {Array<{ day: string}>} entries
 * @returns {Array}
 */
export function sortFuelEntries(entries) {
  return [...entries].sort(
    (a, b) => new Date(b.day).getTime() - new Date(a.day).getTime(),
  );
}

/**
 * Calculates health percentage (0-100) for a given maintenance type based on
 * milage driven since the last service
 *
 * IMPORTANT: Both arrays must be pre-sorted newest first before calling
 *  - sortedServices: sorted by `date` descending
 *  - sortedFuelEntries: sorted by `date` descending
 *
 * pre-sorting once at the call site (useMemo) and passing sorted arrays here
 * avoids redundancy 0(n log n) sorts on every render
 *
 * @param {Array} sortedServices - service entries, newest-first by date
 * @param {string} type          - service type to match (eg 'oil change')
 * @param {number} interval      - recommended service interval in miles
 * @param {Array} sortedFuelEntries - fuel entries, newest first by day
 * @returns {number}
 */
export function calculateHealth(
  sortedServices,
  type,
  interval,
  sortedFuelEntries,
) {
  if (sortedServices.length === 0 || sortedFuelEntries.length === 0) return 100;
  // Arrays are pre-sorted newest-first - Array.find() get the most recent match in O(n)
  const lastService = sortedServices.find((s) => s.serviceType === type);
  if (!lastService) return 100;
  // First entry is the newest odometer reading
  const currentOdo =
    sortedFuelEntries[0]?.odometer ?? lastService.odometerReading;
  const milesSince = currentOdo - lastService.odometerReading;
  return Math.max(0, Math.round(100 - (milesSince / interval) * 100));
}
