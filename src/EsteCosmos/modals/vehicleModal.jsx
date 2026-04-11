import { memo } from "react";
import styles from "../esteCosmos.module.css";

/**
 * Modal for registering a new vessel.
 * @param {{ onClose: function, onSubmit: function }} props
 */
export const VehicleModal = memo(function VehicleModal({ onClose, onSubmit }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.retroCard} ${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>ENLIST VEHICLE</h2>
        <form onSubmit={onSubmit} className={styles.modalForm}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>VEHICLE NAME</label>
            <input
              name="name"
              placeholder="THOUSAND SUNNY"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>MAKE</label>
              <input
                name="make"
                placeholder="GALLEY-LA"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>MODEL</label>
              <input
                name="model"
                placeholder="COLA"
                required
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>SUB-MODEL</label>
              <input
                name="sub_model"
                placeholder="2nd Generation"
                className={styles.input}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>YEAR (ERA)</label>
              <input
                name="year"
                type="number"
                required
                className={styles.input}
              />
            </div>
          </div>
          <button
            type="submit"
            className={`${styles.retroBtn} ${styles.modalSubmitSecondary}`}
          >
            COMMISSION VEHICLE
          </button>
        </form>
      </div>
    </div>
  );
});
