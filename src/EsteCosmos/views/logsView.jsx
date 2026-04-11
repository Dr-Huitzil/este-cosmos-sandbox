import { memo } from "react";
import { Zap, Wrench } from "lucide-react";
import { FuelLogTable } from "../components/fuelLogTable";
import { ServiceLogTable } from "../components/serviceLogTable";
import sharedStyles from "../esteCosmos.module.css";
import ownStyles from "./logsView.module.css";
const styles = { ...ownStyles, ...sharedStyles };

/**
 * Logs view - full fuel and service history tables side by side
 */
export const LogsView = memo(function LogsView({
  fuelEntries,
  serviceEntries,
}) {
  return (
    <div className={styles.viewPad}>
      <h2 className={styles.viewTitle}>
        BLACKBOX<span className={styles.viewTitlePrimary}>LOGS</span>
      </h2>
      <div className={styles.logGrid}>
        <div className={`${styles.retroCard} ${styles.logCard}`}>
          <header className={styles.logCardHeader}>
            <Zap size={20} />
            <span>ENERGY CONSUMPTION</span>
          </header>
          <FuelLogTable entries={fuelEntries} />
        </div>
      </div>
      <div className={`${styles.retroCard} ${styles.logCard}`}>
        <header
          className={`${styles.logCardHeader} ${styles.logCardHeaderPrimary}`}
        >
          <Wrench size={20} />
          <span>REPAIR PROTOCOL</span>
        </header>
        <ServiceLogTable entries={serviceEntries} />
      </div>
    </div>
  );
});
