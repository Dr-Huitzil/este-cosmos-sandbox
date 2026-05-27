## 2024-05-27 - [Optimize Vehicle-Fuel Grouping]
**Learning:** Found an O(V*F) nested iteration pattern for filtering items by foreign key, which can degrade rendering performance in large datasets.
**Action:** Replaced it with a single-pass O(V+F) iteration loop when building memoized mappings.
