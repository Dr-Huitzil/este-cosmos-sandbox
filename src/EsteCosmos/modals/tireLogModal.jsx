import { memo } from "react";
import styles from "../FuelTrackerWindow.module.css";

/**
 * Modal for logging tire pressure readings across all four pods.
 * @param {{ onClose: function, onSubmit: function }} props
 */
export const TireLogModal = memo(function TireLogModal({ onClose, onSubmit }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.retroCard} ${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>PNEUMATIC SCAN</h2>
        <p className={styles.modalSubtitle}>
          Archive pressure telemetry for all tires.
        </p>
        <form onSubmit={onSubmit} className={styles.modalForm}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>FRONT LEFT (PSI)</label>
              /*PORT FORE port has 4 letter and so does left. Fore,ward*/
              <input
                name="fl"
                type="number"
                step="0.1"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>FRONT RIGHT (PSI)</label>
              <input
                name="fr"
                type="number"
                step="0.1"
                required
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>REAR LEFT (PSI)</label>
              <input
                name="rl"
                type="number"
                step="0.1"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>REAR RIGHT (PSI)</label>
              <input
                name="rr"
                type="number"
                step="0.1"
                required
                className={styles.input}
              />
            </div>
          </div>
          <button
            type="submit"
            className={`${styles.retroBtn} ${styles.modalSubmitDark}`}
          >
            FINALIZE SCAN
          </button>
        </form>
      </div>
    </div>
  );
});
