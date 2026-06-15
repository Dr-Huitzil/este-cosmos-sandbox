import { memo, useMemo, useState } from "react";
import { MapPin, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import {
  formatCurrency,
  calculateMPG,
  parseLocalDate,
} from "../../util/fuel-utils";
import { useFleet } from "../../contexts/FleetContext";
import styles from "./fuelLogTable.module.css";

/**
 * Render a table of fuel log entries
 * Wrapped in React.memo - only re-renders when entries reference change
 * @param {{ entries: Array }} props
 */
export const FuelLogTable = memo(function FuelLogTable({ entries = [] }) {
  const { isAiAuthorized } = useFleet();
  const [pageSize, setPageSize] = useState("5");

  // `entries` is assumed to be pre-sorted newest-first to avoid redundant O(N^2 log N) sorts
  const displayedEntries = useMemo(() => {
    if (pageSize === "all") return entries;
    return entries.slice(0, parseInt(pageSize, 10));
  }, [entries, pageSize]);

  if (entries.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Zap className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>NO TELEMETRY</h3>
        <p className={styles.emptySubtitle}>Initialize reactor logging</p>
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
            <option value="100">100</option>
            <option value="all">ALL</option>
          </select>
        </label>
      </div>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.th}>FUEL STATION</th>
            <th className={styles.th}>ODO</th>
            <th className={styles.th}>VOL</th>
            <th className={styles.th}>CR</th>
            <th className={`${styles.th} ${styles.thRight}`}>EFF</th>
          </tr>
        </thead>
        <tbody>
          {displayedEntries.map((entry) => {
            const dynamicMPG = calculateMPG(entry, entries);
            return (
              <tr key={entry.id} className={styles.row}>
                <td className={styles.td}>
                  <div className={styles.cellStack}>
                    <span className={styles.cellPrimary}>
                      {format(parseLocalDate(entry.day), "MMM dd, yyyy")}
                    </span>
                    {entry.gasStation && (
                      <span className={styles.cellSecondary}>
                        <MapPin size={8} /> {entry.gasStation}
                      </span>
                    )}
                  </div>
                </td>
                <td className={`${styles.td} ${styles.tdMono}`}>
                  {entry.odometer?.toLocaleString()}
                </td>
                <td className={styles.td}>{entry.fuelQuantity}</td>
                <td className={`${styles.td} ${styles.tdPrice}`}>
                  {formatCurrency(entry.totalPrice)}
                </td>
                <td className={`${styles.td} ${styles.tdRight}`}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                    {isAiAuthorized && entry.anomalyScore !== undefined && entry.anomalyScore !== null && (
                      <span
                        title={`Anomaly Score: ${entry.anomalyScore.toFixed(3)}`}
                        style={{ display: "flex", alignItems: "center", gap: "4px", color: entry.anomalyScore >= 5.0 ? "#ef4444" : "#10b981" }}
                      >
                        {entry.anomalyScore >= 5.0 ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                      </span>
                    )}
                    {dynamicMPG > 0 ? (
                      <span className={styles.effBadge}>{dynamicMPG} mpg</span>
                    ) : (
                      <span className={styles.partialLabel}>
                        {entry.isFull ? "FULL TANK" : "PARTIAL"}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
