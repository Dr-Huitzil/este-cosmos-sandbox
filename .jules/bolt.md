## 2024-06-07 - Avoid redundant sorting in loop-based utility functions
**Learning:** Utility functions that perform data processing within component render loops (like mapping over entries in `fuelLogTable.jsx`) shouldn't perform their own `.sort()`. Relying on internal `.sort()` creates an O(N^2 log N) performance degradation because the array is resorted on every render loop iteration.
**Action:** Utility functions should accept arrays that are already pre-sorted (e.g. from context hooks or `useMemo` hooks) to keep iteration processing inside loops to O(1) regarding sort complexity.
