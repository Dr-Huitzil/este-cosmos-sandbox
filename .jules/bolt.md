## 2024-05-18 - [Optimize calculateMPG to Prevent O(N^2 log N) Render Slowdowns]
**Learning:** Performance degrades drastically (O(N^2 log N)) if utility functions like `calculateMPG` perform internal `.sort()` operations when executed within render cycles (e.g., inside `.map()` of UI tables). This project relies heavily on the `FleetContext` to provide pre-sorted arrays (newest-first).
**Action:** When creating calculation utilities that need chronological data, pass pre-sorted context arrays as parameters rather than sorting raw data inside the utility function.
