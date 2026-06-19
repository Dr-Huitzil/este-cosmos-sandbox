## 2024-06-19 - Remove O(N log N) internal sorts from list processing functions
**Learning:** Utility functions (like `calculateMPG`) that process collections can cause severe O(N^2 log N) performance degradation when called inside rendering loops (`.map()`) if they internally sort the array on every call. The `FleetContext` already provides pre-sorted arrays.
**Action:** Always refactor utility functions used in render loops to accept and rely on pre-sorted arrays rather than sorting internally. Pass pre-sorted arrays from contexts like `FleetContext` to avoid redundant sorting.
