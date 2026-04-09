import { memo } from "react";
import styles from "../components/diagnosticsPanel.module.css";

/**
 * Health bar indicator for a maintenance interval
 * @param {{ label: string, value: number, icon: React.ReactNode}} props
 */
export const HealthIndicator = memo(function HealthIndicator({
  label,
  value,
  icon,
}) {
  return (
    <div className={styles.healthItem}>
      <div className={styles.healthHeader}>
        <span className={styles.healthLabel}>
          {icon}
          {label}
        </span>
        <span className={styles.healthPercent}>{value}%</span>
      </div>
      <div className={styles.healthBarTrack}>
        <div className={styles.healthBarFill} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
});

/**
 * Tire pressure badge - highlights low pressure in red
 * @param {{ label: string, val: number}} props
 */
export const PressureBadge = memo(function PressureBadge({ label, val }) {
  const isLow = val < 36;
  return (
    <div
      className={`${styles.pressureBadge} ${isLow ? styles.pressureBadgeLow : ""}`}
    >
      <p className={styles.pressureBadgeLabel}>{label}</p>
      <p className={styles.pressureBadgeVal}>{val} PSI</p>
    </div>
  );
});

/**
 * list of recent tire pressure readings (last 5)
 * @param {{ entries: Array }} props
 */
export const TireHistory = memo(function TireHistory({ entries }) {
  if (entries.length === 0) {
    return (
      <div className={styles.tireEmpty}>
        <p className={styles.tireEmptyText}>No Tire Log Archived</p>
      </div>
    );
  }
  return (
    <div className={styles.tireList}>
      {entries.slice(0, 5).map((entry) => (
        <div key={entry.id} className={styles.tireRow}>
          <span className={styles.tireDate}>
            {new Date(entry.date).toLocaleDateString()}
          </span>
          <div className={styles.tirePressures}>
            <span
              className={entry.frontLeft < 36 ? styles.tireLow : styles.tireOk}
            >
              PF:{entry.frontLeft}
            </span>
            <span
              className={entry.frontRight < 36 ? styles.tireLow : styles.tireOk}
            >
              SF:{entry.frontRight}
            </span>
            <span
              className={entry.rearLeft < 36 ? styles.tireLow : styles.tireOk}
            >
              PA:{entry.rearLeft}
            </span>
            <span
              className={entry.rearRight < 36 ? styles.tireLow : styles.tireOk}
            >
              SA:{entry.rearRight}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});
