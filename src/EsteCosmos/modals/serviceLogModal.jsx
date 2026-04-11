import { memo } from "react";
import styles from "../esteCosmos.module.css";

/**
 * Modal for logging a service / maintenance record.
 * @param {{ onClose: function, onSubmit: function, isReimbursable: boolean, onIsReimbursable: function }} props
 */
export const ServiceLogModal = memo(function ServiceLogModal({
  onClose,
  onSubmit,
  isReimbursable,
  onIsReimbursable,
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.retroCard} ${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>VEHICLE MAINTENANCE</h2>
        <form onSubmit={onSubmit} className={styles.modalForm}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>DATE</label>
              <input
                name="date"
                type="date"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>ODOMETER (LY)</label>
              <input
                name="odometer"
                type="number"
                required
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>SERVICE TYPE</label>
            <select
              name="serviceType"
              defaultValue="Oil Change"
              className={styles.select}
            >
              <option value="Oil Change">OIL CHANGE</option>
              <option value="Tire Rotation">TIRE ROTATION</option>
              <option value="Tire Replacement">TIRE REPLACEMENT</option>
              <option value="Brake Service">BRAKE SERVICE</option>
              <option value="General Inspection">GENERAL INSPECTION</option>
              <option value="Other">CUSTOM SERVICE</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>PROVIDER</label>
            <input
              name="provider"
              placeholder="Home Garage"
              className={styles.input}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>DESCRIPTION</label>
            <textarea
              name="description"
              placeholder="Mechanic notes..."
              className={styles.textarea}
            />
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>TOTAL COST (CR)</label>
              <input
                name="cost"
                type="number"
                step="0.01"
                required
                className={styles.input}
              />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fieldGroupBottom}`}>
              <div className={styles.checkRow}>
                <input
                  id="reimbursable"
                  type="checkbox"
                  checked={isReimbursable}
                  onChange={onIsReimbursable}
                  className={styles.check}
                />
                <label htmlFor="reimbursable" className={styles.label}>
                  REIMBURSABLE
                </label>
              </div>
            </div>
          </div>
          {isReimbursable && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>RECLAIM AMOUNT</label>
              <input
                name="reimbursementAmount"
                type="number"
                step="0.01"
                className={styles.input}
              />
            </div>
          )}
          <button
            type="submit"
            className={`${styles.retroBtn} ${styles.modalSubmitSecondary}`}
          >
            LOG REFIT
          </button>
        </form>
      </div>
    </div>
  );
});
