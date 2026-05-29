
## 2024-05-29 - [Avoid implicit sorts in iterative utility functions]
**Learning:** Found an `O(N log N)` array sort inside `calculateMPG`, which is invoked iteratively via `Array.prototype.map()` inside render cycles. This causes an extreme `O(M * N log N)` complexity, destroying frontend performance when calculating metrics over historical telemetry data.
**Action:** When a utility function requires sorted data, shift the sorting responsibility to the caller. Require the caller to pass pre-sorted structures (using `useMemo` on the React side to sort exactly once).
