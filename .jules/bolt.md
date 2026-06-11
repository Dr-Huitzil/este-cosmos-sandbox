## 2026-06-11 - O(N^2 log N) React Render Bottlenecks
**Learning:** Utilities called within React render loops that perform internal sorting, such as calculating MPG dynamically per table row, cause severe O(N^2 log N) performance degradation as data grows.
**Action:** Always pre-sort arrays at the context/hook level and pass the sorted array as a parameter to utility functions used in render loops.
