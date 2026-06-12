## 2024-05-18 - Avoiding O(N^2 log N) sorts in React Render Cycles
**Learning:** Utility functions (like `calculateMPG`) that process collections inside of loops (like table rendering) cause massive O(N^2 log N) performance degradation when they execute internal `.sort()` operations on every invocation.
**Action:** Remove internal `.sort()` operations from utility functions used in rendering loops. Instead, pre-sort arrays at the data-fetching/hook level (e.g. `useFleet` / `sortedFuelEntries`) and pass the pre-sorted arrays directly to components and utility functions.
