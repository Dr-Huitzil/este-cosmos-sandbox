import { memo, useMemo } from "react";
import {
  AlertTriangle,
  PlusCircle,
  Atom,
  Rocket,
  Cpu,
  Zap,
  Wrench,
} from "lucide-react";
import { VehicleCard } from "../components/vehicleCard";
import { FuelLogTable } from "../components/fuelLogTable";
import { ServiceLogTable } from "../components/serviceLogTable";
import {
  HealthIndicator,
  PressureBadge,
  TireHistory,
} from "../components/diagnosticsPanel";
import sharedStyles from "../esteCosmos.module.css";
import ownStyles from "./dashboardView.module.css";
const styles = { ...sharedStyles, ...ownStyles };

/**
 * Dashboard view — fleet overview, diagnostics sidebar, and tabbed log detail.
 */
export const DashboardView = memo(function DashboardView({
  alerts,
  vehicles,
  fuelEntries,
  selectedVehicleId,
  selectedVehicle,
  serviceEntries,
  tireEntries,
  activeTab,
  oilHealth,
  thrusterHealth,
  onSetActiveTab,
  onOpenNewVehicle,
  onSelectVehicle,
}) {
  // Stable per-vehicle entry slices — prevents inline filter creating new arrays on every render
  const vehicleFuelMap = useMemo(() => {
    const map = {};
    vehicles.forEach((v) => {
      map[v.id] = fuelEntries.filter((e) => e.vehicleId === v.id);
    });
    return map;
  }, [vehicles, fuelEntries]);

  const activeTabFuelEntries = useMemo(
    () => fuelEntries.filter((e) => e.vehicleId === selectedVehicleId),
    [fuelEntries, selectedVehicleId],
  );

  const activeTabServiceEntries = useMemo(
    () => serviceEntries.filter((s) => s.vehicleId === selectedVehicleId),
    [serviceEntries, selectedVehicleId],
  );

  const activeTabTireEntries = useMemo(
    () => tireEntries.filter((t) => t.vehicleId === selectedVehicleId),
    [tireEntries, selectedVehicleId],
  );

  const latestTire = tireEntries.length > 0 ? tireEntries[0] : null;

  return (
    <div className={styles.viewPad}>
      <header className={styles.viewHeader}>
        <h1 className={styles.viewTitle}>
          OPERATIONS<span className={styles.viewTitleAccent}>HUB</span>
        </h1>
        <p className={styles.viewSubtitle}>
          Monitoring active sector: GRAND LINE
        </p>
      </header>

      {alerts.length > 0 && (
        <div className={styles.alertGrid}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`${styles.alertBox} ${
                alert.variant === "destructive"
                  ? styles.alertDestructive
                  : styles.alertWarning
              }`}
            >
              <AlertTriangle className={styles.alertIcon} />
              <div>
                <h3 className={styles.alertTitle}>{alert.title}</h3>
                <p className={styles.alertDesc}>{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <section className={styles.fleetSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>ACTIVE FLEET</h2>
          <button className={styles.retroBtn} onClick={onOpenNewVehicle}>
            <PlusCircle size={20} /> ENLIST VEHICLE
          </button>
        </div>
        <div className={styles.fleetGrid}>
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              entries={vehicleFuelMap[vehicle.id] || []}
              onSelect={onSelectVehicle}
              isActive={selectedVehicleId === vehicle.id}
            />
          ))}
        </div>
      </section>

      {selectedVehicle && (
        <div className={styles.dashboardDetail}>
          <div className={styles.tabsPanel}>
            <div className={styles.tabList}>
              {["fuel", "maintenance", "tires"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => onSetActiveTab(tab)}
                  className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ""}`}
                >
                  {tab === "fuel"
                    ? "REACTOR"
                    : tab === "maintenance"
                      ? "REPLACEMENTS"
                      : "BODY"}
                </button>
              ))}
            </div>

            {activeTab === "fuel" && (
              <FuelLogTable entries={activeTabFuelEntries} />
            )}
            {activeTab === "maintenance" && (
              <ServiceLogTable entries={activeTabServiceEntries} />
            )}
            {activeTab === "tires" && (
              <TireHistory entries={activeTabTireEntries} />
            )}
          </div>

          <aside className={styles.diagnosticsAside}>
            <div className={`${styles.retroCard} ${styles.diagnosticsCard}`}>
              <h3 className={styles.diagnosticsTitle}>DIAGNOSTICS</h3>
              <div className={styles.diagnosticsBody}>
                <HealthIndicator
                  label="ENGINE OIL"
                  value={oilHealth}
                  icon={<Atom size={20} />}
                />
                <HealthIndicator
                  label="TIRE HEALTH"
                  value={thrusterHealth}
                  icon={<Rocket size={20} />}
                />
                <div className={styles.hullSection}>
                  <h4 className={styles.hullTitle}>
                    <Cpu size={16} /> BODY SCAN Telemetry
                  </h4>
                  {latestTire ? (
                    <div className={styles.pressureGrid}>
                      <PressureBadge
                        label="FRONT LEFT"
                        val={latestTire.frontLeft}
                      />
                      <PressureBadge
                        label="FRONT RIGHT"
                        val={latestTire.frontRight}
                      />
                      <PressureBadge
                        label="REAR LEFT"
                        val={latestTire.rearLeft}
                      />
                      <PressureBadge
                        label="REAR RIGHT"
                        val={latestTire.rearRight}
                      />
                    </div>
                  ) : (
                    <p className={styles.hullNoData}>No body Data Synced.</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
});
