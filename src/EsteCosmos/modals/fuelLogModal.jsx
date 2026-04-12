import { memo } from "react";
import styles from "../esteCosmos.module.css";
import { useFuelTracker } from "../../hooks/useEsteCosmos";

/**
 * Modal for logging a fleet fuel telemetry entry.
 */
export const FuelLogModal = memo(function FuelLogModal() {
  const { handleCloseFuelLog, handleAddFuelLog, isFull, handleIsFull } =
    useFuelTracker();

  return (
    <div className={styles.modalOverlay} onClick={handleCloseFuelLog}>
      <div
        className={`${styles.retroCard} ${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>FLUID SYNTHESIS</h2>
        <form onSubmit={handleAddFuelLog} className={styles.modalForm}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>DATE</label>
              <input name="day" type="date" required className={styles.input} />
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
              placeholder="OXXO"
              className={styles.input}
            />
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
              <label className={styles.label}>CREDITS ('$')</label>
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
