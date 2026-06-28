
## 2024-06-25 - Prevent O(N^2 log N) degradation in table loops
**Learning:** Table components re-calculating values across their entire collection during rendering loops (like `FuelLogTable` doing `calculateMPG(entry, entries)`) can suffer from severe O(N^2 log N) degradation if the utility function internally performs an O(N log N) `.sort()` operation.
**Action:** Utility functions processing collections that run inside loops should assume pre-sorted data. Contexts/Hooks (like `FleetContext`) should expose robust, memoized pre-sorted arrays (`sortedFuelEntries`) and table components should pass these pre-sorted arrays to the utility functions rather than unsorted subsets to avoid redundant internal sort operations.
