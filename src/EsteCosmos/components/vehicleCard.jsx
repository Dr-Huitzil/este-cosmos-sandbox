import { memo, useMemo } from "react";
import { Gauge, Zap, Rocket } from "lucide-react";
import styles from "./vehicleCard.module.css";

/**
 * Displays a single vehicle card with latest odometer and avergage efficiency
 * Wrapped in React.memo so it only re-renders when the props change
 * @param {{ vehicle: object, entries: Array, onSelect: function, isActive?:boolean}} props
 */
export const VehicleCard = memo(function VehicleCar({
  vehicle,
  entries,
  onSelect,
  isActive,
}) {
  const latestEntry = useMemo(() => {
    if (entries.length === 0) return null;
    return [...entries].sort(
      (a, b) => new Date(b.day).getTime() - new Date(a.day).getTime(),
    )[0];
  }, [entries]);

  const avgMileage = useMemo(() => {
    const validMileages = entries.filter((e) => e.mileage > 0);
    if (validMileages.length === 0) return "0";
    return (
      validMileages.reduce((sum, e) => sum + e.mileage, 0) /
      validMileages.length
    ).toFixed(1);
  }, [entries]);

  return (
    <div
      className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
      onClick={() => onSelect(vehicle.id)}
    >
      <div className={styles.imageWrapper}>
        <img
          src={`https://picsum.photos/seed/${vehicle.id}/600/400`}
          alt={vehicle.name}
          className={styles.image}
        />
        <div className={styles.imageOverlay} />
        <div className={styles.imageFooter}>
          <div className={styles.vehicleTitle}>
            <h3 className={styles.vehicleName}>{vehicle.name}</h3>
            <p className={styles.vehicleSubtitle}>
              {vehicle.make} / {vehicle.model}
            </p>
          </div>
          <div className={styles.rocketBadge}>
            <Rocket size={20} className={styles.rocketIcon} />
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>
            <Gauge size={12} /> DISTANCE
          </p>
          <p className={styles.statValue}>
            {latestEntry
              ? `${latestEntry.odometer.toLocaleString()} LY`
              : "---"}
          </p>
          <div className={`${styles.statItem} ${styles.statRight}`}>
            <p className={`${styles.statItem} ${styles.statLabelRight}`}>
              <Zap size={12} /> EFFICIENCY
            </p>
            <p className={`${styles.statValue} ${styles.statValuePrimary}`}>
              {avgMileage} U/C
            </p>
          </div>
        </div>
      </div>

      <div className={styles.accessBridge}>
        <p className={styles.accessBridgeText}>ACCESS BRIDGE</p>
      </div>
    </div>
  );
});
