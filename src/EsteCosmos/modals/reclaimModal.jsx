import { memo } from "react";
import styles from "../esteCosmos.module.css";
import { useUI } from "../../contexts/UIContext";
import { useFleet } from "../../contexts/FleetContext";

/**
 * Modal for logging a reimbursement / berry reclaim.
 */
export const ReclaimModal = memo(function ReclaimModal() {
  const { handleCloseReclaim } = useUI();
  const { handleAddReclaim } = useFleet();

  return (
    <div className={styles.modalOverlay} onClick={handleCloseReclaim}>
      <div
        className={`${styles.retroCard} ${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>BERRY RECLAIM</h2>
        <form onSubmit={handleAddReclaim} className={styles.modalForm}>
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
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>RECLAIM AMOUNT ($)</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>MEMO</label>
            <textarea
              name="description"
              placeholder="e.g. Weekly field gas reimbursement"
              className={styles.textarea}
            />
          </div>
          <button
            type="submit"
            className={`${styles.retroBtn} ${styles.modalSubmitSecondary}`}
          >
            LOG RECLAIM
          </button>
        </form>
      </div>
    </div>
  );
});
