import { memo, useMemo, useState } from "react";
import { Banknote } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency, parseLocalDate } from "../../util/fuel-utils";
// We safely reuse the fuelLogTable CSS for consistent UI between the two tables
import styles from "./fuelLogTable.module.css";

/**
 * Render a table of reimbursement (Berry Reclaim) entries
 * Wrapped in React.memo - only re-renders when entries reference change
 * @param {{ entries: Array }} props
 */
export const ReclaimLogTable = memo(function ReclaimLogTable({ entries = [] }) {
  const [pageSize, setPageSize] = useState("5");

  // ⚡ Bolt Performance Optimization:
  // Removed redundant O(N log N) sorting. `entries` prop is assumed to be pre-sorted.

  const displayedEntries = useMemo(() => {
    if (pageSize === "all") return entries;
    return entries.slice(0, parseInt(pageSize, 10));
  }, [entries, pageSize]);

  if (entries.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Banknote
          className={styles.emptyIcon}
          style={{ color: "hsl(var(--secondary))" }}
        />
        <h3 className={styles.emptyTitle}>NO RECLAIMS</h3>
        <p className={styles.emptySubtitle}>No berry deposits cataloged</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableHeaderControls}>
        <label className={styles.pageSelectLabel}>
          SHOW:
          <select
            className={styles.pageSelect}
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="all">ALL</option>
          </select>
        </label>
      </div>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.th}>DATE</th>
            <th className={styles.th}>MEMO</th>
            <th className={`${styles.th} ${styles.thRight}`}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {displayedEntries.map((entry) => (
            <tr key={entry.id} className={styles.row}>
              <td className={styles.td}>
                <span className={styles.cellPrimary}>
                  {format(parseLocalDate(entry.day), "MMM dd, yyyy")}
                </span>
              </td>
              <td className={styles.td}>
                {entry.description || (
                  <span className={styles.partialLabel}>NO MEMO</span>
                )}
              </td>
              <td
                className={`${styles.td} ${styles.tdRight} ${styles.tdMono}`}
                style={{ color: "hsl(var(--secondary))" }}
              >
                +{formatCurrency(entry.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
