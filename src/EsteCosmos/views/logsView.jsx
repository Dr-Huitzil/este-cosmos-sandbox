import { memo } from "react";
import { Zap, Wrench, Banknote } from "lucide-react";
import { FuelLogTable } from "../components/fuelLogTable";
import { ServiceLogTable } from "../components/serviceLogTable";
import { ReclaimLogTable } from "../components/reclaimLogTable";
import sharedStyles from "../esteCosmos.module.css";
import ownStyles from "./logsView.module.css";
const styles = { ...ownStyles, ...sharedStyles };

import { useFleet } from "../../contexts/FleetContext";

/**
 * Logs view - full fuel and service history tables side by side
 */
export const LogsView = memo(function LogsView() {
  const { sortedFuelEntries, serviceEntries, reclaimEntries } = useFleet();

  return (
    <div className={styles.viewPad}>
      <h2 className={styles.viewTitle}>
        MAINTENANCE<span className={styles.viewTitlePrimary}>LOGS</span>
      </h2>
      <div className={styles.logGrid}>
        <div className={`${styles.retroCard} ${styles.logCard}`}>
          <header className={styles.logCardHeader}>
            <Zap size={20} />
            <span>FUEL CONSUMPTION</span>
          </header>
          <FuelLogTable entries={sortedFuelEntries} />
        </div>
        <div className={`${styles.retroCard} ${styles.logCard}`}>
          <header className={styles.logCardHeader}>
            <Banknote size={20} />
            <span>REIMBURSEMENT LOGS</span>
          </header>
          <ReclaimLogTable entries={reclaimEntries} />
        </div>
      </div>
      <div className={`${styles.retroCard} ${styles.logCard}`}>
        <header
          className={`${styles.logCardHeader} ${styles.logCardHeaderPrimary}`}
        >
          <Wrench size={20} />
          <span>REPAIR LOGS</span>
        </header>
        <ServiceLogTable entries={serviceEntries} />
      </div>
    </div>
  );
});
