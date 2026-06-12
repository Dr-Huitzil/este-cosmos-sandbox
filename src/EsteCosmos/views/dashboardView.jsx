import { memo, useMemo } from "react";
import {
  AlertTriangle,
  PlusCircle,
  Atom,
  Rocket,
  Cpu,
  Zap,
  Wrench,
  ChevronLeft,
  ChevronRight,
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

import { useUI } from "../../contexts/UIContext";
import { useFleet } from "../../contexts/FleetContext";
import { useAnalytics } from "../../contexts/AnalyticsContext";

/**
 * Dashboard view — fleet overview, diagnostics sidebar, and tabbed log detail.
 */
export const DashboardView = memo(function DashboardView() {
  const {
    activeTab,
    handleSetActiveTab,
    handleOpenNewVehicle,
  } = useUI();

  const {
    vehicles,
    sortedFuelEntries,
    selectedVehicleId,
    selectedVehicle,
    sortedServiceEntries,
    sortedTireEntries,
    handleSelectVehicle,
  } = useFleet();

  const {
    alerts,
    oilHealth,
    thrusterHealth,
  } = useAnalytics();

  // Stable per-vehicle entry slices — prevents inline filter creating new arrays on every render
  const vehicleFuelMap = useMemo(() => {
    const map = {};
    vehicles.forEach((v) => {
      map[v.id] = sortedFuelEntries.filter((e) => e.vehicleId === v.id);
    });
    return map;
  }, [vehicles, sortedFuelEntries]);

  const activeTabFuelEntries = useMemo(
    () => sortedFuelEntries.filter((e) => e.vehicleId === selectedVehicleId),
    [sortedFuelEntries, selectedVehicleId],
  );

  const activeTabServiceEntries = useMemo(
    () => sortedServiceEntries.filter((s) => s.vehicleId === selectedVehicleId),
    [sortedServiceEntries, selectedVehicleId],
  );

  const activeTabTireEntries = useMemo(
    () => sortedTireEntries.filter((t) => t.vehicleId === selectedVehicleId),
    [sortedTireEntries, selectedVehicleId],
  );

  const latestTire = sortedTireEntries.length > 0 ? sortedTireEntries[0] : null;

  return (
    <div className={styles.viewPad}>
      <header className={styles.viewHeader}>
        <h1 className={styles.viewTitle}>
          OPERATIONS<span className={styles.viewTitleAccent}>HUB</span>
        </h1>
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
          <button className={styles.retroBtn} onClick={handleOpenNewVehicle}>
            <PlusCircle size={20} /> ENLIST VEHICLE
          </button>
        </div>
        <div className={styles.fleetGrid}>
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              entries={vehicleFuelMap[vehicle.id] || []}
              onSelect={handleSelectVehicle}
              isActive={selectedVehicleId === vehicle.id}
            />
          ))}
        </div>
      </section>

      {selectedVehicle && (
        <div className={styles.dashboardDetail}>
          <div className={styles.tabsPanel}>
            {/* Mobile Tab Carousel */}
            <div className={styles.tabCarousel}>
              <button
                className={styles.carouselBtn}
                onClick={() => {
                  const tabs = ["fuel", "maintenance", "tires"];
                  const idx = tabs.indexOf(activeTab);
                  handleSetActiveTab(
                    tabs[(idx - 1 + tabs.length) % tabs.length],
                  );
                }}
              >
                <ChevronLeft size={24} />
              </button>
              <div
                className={`${styles.tabBtn} ${styles.tabBtnActive} ${styles.carouselLabel}`}
              >
                {activeTab === "fuel"
                  ? "FUEL"
                  : activeTab === "maintenance"
                    ? "MAINTENANCE"
                    : "TIRES"}
              </div>
              <button
                className={styles.carouselBtn}
                onClick={() => {
                  const tabs = ["fuel", "maintenance", "tires"];
                  const idx = tabs.indexOf(activeTab);
                  handleSetActiveTab(tabs[(idx + 1) % tabs.length]);
                }}
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Desktop Tab List */}
            <div className={styles.tabList}>
              {["fuel", "maintenance", "tires"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleSetActiveTab(tab)}
                  className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ""}`}
                >
                  {tab === "fuel"
                    ? "FUEL"
                    : tab === "maintenance"
                      ? "MAINTENANCE"
                      : "TIRES"}
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
