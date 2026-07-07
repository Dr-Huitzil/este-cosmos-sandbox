## 2024-11-20 - Removed redundant sort in calculateMPG
**Learning:** The `calculateMPG` utility in `src/util/fuel-utils.jsx` had an internal `O(N log N)` sort inside a loop during render because `allEntries` is already pre-sorted by `FleetContext`.
**Action:** Removed the `sort()` operation from `calculateMPG` to avoid redundant O(N^2 log N) degradation since the generic `entries` props are provided fully sorted.
