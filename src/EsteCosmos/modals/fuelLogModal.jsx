import { memo, useEffect } from "react";
import styles from "../esteCosmos.module.css";
import { useUI } from "../../contexts/UIContext";
import { useFleet } from "../../contexts/FleetContext";

/**
 * Modal for logging a fleet fuel telemetry entry.
 */
export const FuelLogModal = memo(function FuelLogModal() {
  const { handleCloseFuelLog } = useUI();
  const { handleAddFuelLog, isFull, handleIsFull, sortedFuelEntries } = useFleet();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseFuelLog();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCloseFuelLog]);

  // "Memory" feature: find unique previous gas stations and the most recent one
  const previousStations = [
    ...new Set(
      sortedFuelEntries.map((e) => e.gasStation).filter((s) => s && s.trim()),
    ),
  ];
  const lastStation = sortedFuelEntries[0]?.gasStation || "";

  return (
    <div className={styles.modalOverlay} onClick={handleCloseFuelLog}>
      <div
        className={`${styles.retroCard} ${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>FUEL SYNTHESIS</h2>
        <form onSubmit={handleAddFuelLog} className={styles.modalForm}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>DATE</label>
              <input
                name="day"
                type="date"
                defaultValue={new Date().toLocaleDateString("en-CA")}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>ODOMETER</label>
              <input
                name="odometer"
                type="number"
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>GAS STATION</label>
            <input
              name="gasStation"
              placeholder="VALERO / SHELL / BP"
              className={styles.input}
              defaultValue={lastStation}
              list="previous-stations"
            />
            <datalist id="previous-stations">
              {previousStations.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>VOLUME (G)</label>
              <input
                name="quantity"
                type="number"
                step="0.001"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>TOTALCOST ('$')</label>
              <input
                name="totalPrice"
                type="number"
                step="0.01"
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.checkRow}>
            <input
              id="fullTank"
              type="checkbox"
              checked={isFull}
              onChange={handleIsFull}
              className={styles.check}
            />
            <label htmlFor="full-tank" className={styles.label}>
              FULL TANK
            </label>
          </div>
          <button
            type="submit"
            className={`${styles.retroBtn} ${styles.modalSubmitPrimary}`}
          >
            RECORD TELEMETRY
          </button>
        </form>
      </div>
    </div>
  );
});
