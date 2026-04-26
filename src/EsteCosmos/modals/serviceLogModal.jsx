import { memo } from "react";
import styles from "../esteCosmos.module.css";
import { useFuelTracker } from "../../hooks/useEsteCosmos";

/**
 * Modal for logging a service / maintenance record.
 */
export const ServiceLogModal = memo(function ServiceLogModal() {
  const {
    handleCloseServiceLog,
    handleAddServiceLog,
    isReimbursable,
    handleIsReimbursable,
  } = useFuelTracker();

  return (
    <div className={styles.modalOverlay} onClick={handleCloseServiceLog}>
      <div
        className={`${styles.retroCard} ${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>VEHICLE MAINTENANCE</h2>
        <form onSubmit={handleAddServiceLog} className={styles.modalForm}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>DATE</label>
              <input
                name="date"
                type="date"
                defaultValue={new Date().toLocaleDateString('en-CA')}
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
                  onChange={handleIsReimbursable}
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
