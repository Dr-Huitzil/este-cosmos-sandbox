import { memo, useMemo } from "react";
import { Gauge, Zap, Rocket } from "lucide-react";
import styles from "./vehicleCard.module.css";
import starsImg from "../../assets/images/stars.jpg";

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
    if (entries.length < 2) return "0";

    // Sort oldest first for chronological processing
    const sorted = [...entries].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
    );

    const firstFull = sorted.find((e) => e.isFull);
    const lastFull = sorted.findLast((e) => e.isFull);

    if (!firstFull || !lastFull || firstFull.id === lastFull.id) return "0";

    let totalFuel = 0;
    let started = false;
    for (const e of sorted) {
      if (e.id === firstFull.id) {
        started = true;
        continue;
      }
      if (started) {
        totalFuel += e.fuelQuantity;
        if (e.id === lastFull.id) break;
      }
    }

    if (totalFuel === 0) return "0";
    return ((lastFull.odometer - firstFull.odometer) / totalFuel).toFixed(1);
  }, [entries]);

  return (
    <div
      className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
      onClick={() => onSelect(vehicle.id)}
    >
      <div className={styles.imageWrapper}>
        <img
          src={starsImg}
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
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>
            <Gauge size={12} /> DISTANCE
          </p>
          <p className={styles.statValue}>
            {latestEntry ? `${latestEntry.odometer.toLocaleString()} m` : "---"}
          </p>
        </div>
        <div className={`${styles.statItem} ${styles.statRight}`}>
          <p className={`${styles.statLabel} ${styles.statLabelRight}`}>
            <Zap size={12} /> EFFICIENCY
          </p>
          <p className={`${styles.statValue} ${styles.statValuePrimary}`}>
            {avgMileage} mpg
          </p>
        </div>
      </div>
    </div>
  );
});
