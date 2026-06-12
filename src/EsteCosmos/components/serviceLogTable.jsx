import { memo, useMemo } from "react";
import { Wrench, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency, parseLocalDate } from "../../util/fuel-utils";
import styles from "./serviceLogTable.module.css";

/**
 * Renders a table of service/maintenance log entries
 * wrapped in React.memo - only re-renders when entries array reference changes
 * @param {{ entries: Array }} props
 */
export const ServiceLogTable = memo(function ServiceLogTable({ entries = [] }) {
  if (entries.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Wrench className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>NO RECORDS</h3>
        <p className={styles.emptySubtitle}>
          Keep your vehicle trip-ready by logging maintenance
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={styles.th}>SERVICE</th>
            <th className={styles.th}>DATE</th>
            <th className={styles.th}>ODOMETER</th>
            <th className={`${styles.th} ${styles.thRight}`}>COST</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className={styles.row}>
              <td className={styles.td}>
                <div className={styles.cellStack}>
                  <div className={styles.serviceTypeRow}>
                    <span className={styles.serviceType}>
                      {entry.serviceType}
                    </span>
                    {entry.reimbursable && (
                      <span
                        className={styles.reimbursableBadge}
                        title={`Reimbursable: ${formatCurrency(entry.reimbursementAmount || 0)}`}
                      >
                        <CheckCircle2 size={12} />
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className={styles.td}>
                {format(parseLocalDate(entry.date), "MMM dd, yyyy")}
              </td>
              <td className={`${styles.td} ${styles.tdMono}`}>
                {entry.odometerReading.toLocaleString()}
              </td>
              <td className={`${styles.td} ${styles.tdRight}`}>
                <div className={styles.costStack}>
                  <span className={styles.totalCost}>
                    {formatCurrency(entry.totalCost)}
                  </span>
                  {entry.reimbursable && (
                    <span className={styles.netCost}>
                      Net:{" "}
                      {formatCurrency(
                        entry.totalCost - (entry.reimbursementAmount || 0),
                      )}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
