import { memo, useMemo } from "react";
import { MapPin, Zap } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "../../util/fuel-utils";
import styles from "./fuelLogTable.module.css";

/**
 * Render a table of fuel log entries
 * Wrapped in React.memo - only re-renders when entries reference change
 * @param {{ entries: Array }} props
 */
export const FuelLogTable = memo(function FuelLogTable({ entries }) {
  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(b.day).getTime() - new Date(a.day).getTime(),
      ),
    [entries],
  );

  if (entries.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Zap className={styles.emptyIcon}>
          <h3 className={styles.emptyTitle}>NO TELEMETRY</h3>
          <p className={styles.emptySubtitle}>Initialize logging</p>
        </Zap>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.th}>FUEL &amp; STATION</th>
            <th className={styles.th}>ODO</th>
            <th className={styles.th}>VOL</th>
            <th className={styles.th}>CR</th>
            <th className={`${styles.th} ${styles.thRight}`}>EFF</th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.map((entry) => (
            <tr key={entry.id} className={styles.row}>
              <td className={styles.td}>
                <div className={styles.cellStack}>
                  <span className={styles.cellPrimary}>
                    {format(new Date(entry.day), "MM DD, YYYY")}
                  </span>
                  {entry.gasStation && (
                    <span className={styles.cellSecondary}>
                      <MapPin size={8} /> {entry.gasStation}
                    </span>
                  )}
                </div>
              </td>
              <td className={`${styles.td} ${styles.tdMono}`}>
                {entry.odometer.toLocalString()}
              </td>
              <td className={styles.td}>{entry.fuelQuantity}</td>
              <td className={`${styles.td} ${styles.tdPrice}`}>
                {formatCurrency(entry.totalPrice)}
              </td>
              <td className={`${styles.td} ${styles.tdRight}`}>
                {entry.mileage > 0 ? (
                  <span className={styles.effBadge}>{entry.mileage} U/C</span>
                ) : (
                  <span className={styles.partialLabel}>
                    {entry.isFull ? "FULL TANK" : "PARTIAL"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
