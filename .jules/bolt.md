
## 2026-06-01 - [O(N^2 log N) Bottleneck in utility mapping]
**Learning:** React contexts rendering arrays (`AnalyticsContext`, `FleetContext`) frequently iterate through utility mapping functions (e.g. `calculateMPG`, `calculateHealth`). If those utilities internally `.sort()` the history arrays on every mapping pass, it leads to heavy O(N^2 log N) performance degradation on every render.
**Action:** Always accept pre-sorted array values (e.g., `sortedEntries`) in calculation loops to rely on contextual state optimizations and prevent redundant sorting operations.
