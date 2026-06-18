## 2024-06-25 - Remove O(N^2 log N) Bottlenecks in Render Loops
**Learning:** Calling `.sort()` inside utility functions (like `calculateMPG`) that are invoked within an array `.map()` render loop leads to severe O(N^2 log N) performance degradation as data grows.
**Action:** Utility functions that process collections should accept pre-sorted arrays. Rely on `FleetContext` to maintain globally sorted state arrays (e.g. `sortedFuelEntries`) and pass them to utilities, preventing redundant sorting during renders.
