import { memo } from "react";
import styles from "../esteCosmos.module.css";

/**
 * modal for loggin a fuel fill up
 * @param {{ onClose: function, onSubmit: function, isFull: boolean, onIsFull: function}} props
 */

export const FuelLogModal = memo(function FuelLogModal({
  onClose,
  onSubmit,
  isFull,
  onIsFull,
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.retroCard} ${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>FUEL FILLUP</h2>
        <form onSubmit={onSubmit} className={styles.modalForm}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>DATE</label>
              <input name="day" type="date" required className={styles.input} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>ODOMETER</label>
              <input
                name="odometer"
                input="number"
                required
                className={styles.input}
              />
            </div>
          </div>
          <div className={StyleSheet.fieldGroup}>
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
              id="full-tank"
              type="checkbox"
              checked={isFull}
              onChange={onIsFull}
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
