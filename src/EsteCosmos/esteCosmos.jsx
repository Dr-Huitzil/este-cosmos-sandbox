import {
  Rocket,
  Zap,
  History,
  LineChart,
  Settings,
  LayoutDashboard,
  Plus,
  Wrench,
  Moon,
  Sun,
  Loader2,
} from "lucide-react";
import { AuthScreen } from "./views/authScreen";
import { NavItem, MobileNavItem } from "./components/navItem";
import { DashboardView } from "./views/dashboardView";
import { LogsView } from "./views/logsView";
import { AnalyticsView } from "./views/analyticsView";
import { SettingsView } from "./views/settingsView";
import { VehicleModal } from "./modals/vehicleModal";
import { FuelLogModal } from "./modals/fuelLogModal";
import { ServiceLogModal } from "./modals/serviceLogModal";
import { TireLogModal } from "./modals/tireLogModal";
import { ReclaimModal } from "./modals/reclaimModal";
import { useFuelTracker, isSafePhotoURL } from "../hooks/useEsteCosmos";
import { Toaster } from "@/ui/toaster";
import styles from "./esteCosmos.module.css";

/**
 * FuelTrackerWindow — self-contained React widget for fleet telemetry tracking.
 * This file is intentionally a thin shell: all logic lives in useFuelTracker,
 * all views in their own View files, and all modals in modals/.
 */
export default function FuelTrackerWindow() {
  const {
    user,
    isUserLoading,
    rootRef,
    currentView,
    isDarkMode,
    isNewVehicleOpen,
    isNewFuelLogOpen,
    isNewServiceLogOpen,
    isNewTireLogOpen,
    isNewReclaimOpen,
    isMobileFabOpen,
    navToDashboard,
    navToLogs,
    navToAnalytics,
    navToSettings,
    handleToggleFab,
    handleOpenFuelLog,
    fabOpenFuel,
    fabOpenService,
    fabOpenReclaim,
    fabOpenVehicle,
    toggleTheme,
  } = useFuelTracker();

  // ── Loading / auth guards ────────────────────────────────────────
  if (isUserLoading) {
    return (
      <div ref={rootRef} className={styles.loadingScreen}>
        <Loader2 className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Syncing Network...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div ref={rootRef} className={styles.window}>
        <AuthScreen />
        <Toaster />
      </div>
    );
  }

  // ── Main layout ──────────────────────────────────────────────────
  return (
    <div ref={rootRef} className={styles.window}>
      {/* ── Sidebar (desktop) ─────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandIcon}>
            <Rocket size={32} className={styles.brandRocketIcon} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandLine1}>ESTE</span>
            <span className={styles.brandLine2}>COSMOS</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <NavItem
            icon={<LayoutDashboard />}
            label="HANGAR"
            active={currentView === "dashboard"}
            onClick={navToDashboard}
          />
          <NavItem
            icon={<History />}
            label="BLACKBOX"
            active={currentView === "logs"}
            onClick={navToLogs}
          />
          <NavItem
            icon={<LineChart />}
            label="SYSTEMS"
            active={currentView === "analytics"}
            onClick={navToAnalytics}
          />
          <NavItem
            icon={<Settings />}
            label="CONSOLE"
            active={currentView === "settings"}
            onClick={navToSettings}
          />
        </nav>

        <footer className={styles.sidebarFooter}>
          <div className={styles.sidebarAvatarWrap}>
            {isSafePhotoURL(user.photoURL) ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Pilot"}
                className={styles.sidebarAvatar}
              />
            ) : (
              <div className={styles.sidebarAvatarFallback}>
                {user.displayName?.charAt(0) || "P"}
              </div>
            )}
          </div>
          <div className={styles.sidebarUserInfo}>
            <p className={styles.sidebarUsername}>
              {user.displayName || "PILOT"}
            </p>
            <div className={styles.sidebarStatus}>
              <span className={styles.statusDot} />
              <p className={styles.statusText}>LINK ACTIVE</p>
            </div>
          </div>
        </footer>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <div className={styles.topBarMobileBrand}>
            <h1 className={styles.mobileBrandTitle}>ESTE COSMOS</h1>
          </div>
          <div className={styles.topBarActions}>
            <button
              className={`${styles.retroBtn} ${styles.iconBtn}`}
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              style={{ color: isDarkMode ? "#ffcc00" : "#a78bfa" }}
            >
              {isDarkMode ? (
                <Sun size={24} />
              ) : (
                <Moon size={24} />
              )}
            </button>
            <div className={styles.desktopQuickActions}>
              <button
                className={`${styles.retroBtn} ${styles.iconBtn}`}
                onClick={handleToggleFab}
                title="Quick Action Menu"
              >
                <Plus size={24} />
              </button>
              {isMobileFabOpen && (
                <div className={`${styles.fabMenu} ${styles.desktopMenu}`}>
                  <button className={styles.fabMenuItem} onClick={fabOpenFuel}>
                    {" "}
                    <Zap size={16} /> LOG FUEL
                  </button>
                  <button
                    className={styles.fabMenuItem}
                    onClick={fabOpenService}
                  >
                    {" "}
                    <Wrench size={16} /> LOG SERVICE
                  </button>
                  <button
                    className={styles.fabMenuItem}
                    onClick={fabOpenVehicle}
                  >
                    {" "}
                    <Rocket size={16} /> ENLIST VEHICLE
                  </button>
                  <button
                    className={styles.fabMenuItem}
                    onClick={fabOpenReclaim}
                  >
                    {" "}
                    <span style={{ fontSize: "16px", lineHeight: 1 }}>
                      💰
                    </span>{" "}
                    LOG RECLAIM
                  </button>
                </div>
              )}
            </div>
            <button
              className={`${styles.retroBtn} ${styles.refuelBtn}`}
              onClick={handleOpenFuelLog}
            >
              <Zap size={16} /> REFUEL
            </button>
          </div>
        </header>

        <div className={styles.viewContainer}>
          {currentView === "dashboard" && <DashboardView />}
          {currentView === "logs" && <LogsView />}
          {currentView === "analytics" && <AnalyticsView />}
          {currentView === "settings" && <SettingsView />}
        </div>

        {/* ── Bottom nav (mobile) ──────────────────────────────── */}
        <nav className={styles.bottomNav}>
          <MobileNavItem
            icon={<LayoutDashboard size={24} />}
            label="HUB"
            active={currentView === "dashboard"}
            onClick={navToDashboard}
          />
          <MobileNavItem
            icon={<History size={24} />}
            label="LOGS"
            active={currentView === "logs"}
            onClick={navToLogs}
          />

          <div className={styles.fabWrap}>
            <button className={styles.fab} onClick={handleToggleFab}>
              <Plus size={40} />
            </button>
            {isMobileFabOpen && (
              <div className={styles.fabMenu}>
                <button className={styles.fabMenuItem} onClick={fabOpenFuel}>
                  {" "}
                  <Zap size={16} /> LOG FUEL
                </button>
                <button className={styles.fabMenuItem} onClick={fabOpenService}>
                  {" "}
                  <Wrench size={16} /> LOG SERVICE
                </button>
                <button className={styles.fabMenuItem} onClick={fabOpenVehicle}>
                  {" "}
                  <Rocket size={16} /> ENLIST VEHICLE
                </button>
                <button className={styles.fabMenuItem} onClick={fabOpenReclaim}>
                  {" "}
                  <span style={{ fontSize: "16px", lineHeight: 1 }}>
                    💰
                  </span>{" "}
                  LOG RECLAIM
                </button>
              </div>
            )}
          </div>

          <MobileNavItem
            icon={<LineChart size={24} />}
            label="STATS"
            active={currentView === "analytics"}
            onClick={navToAnalytics}
          />
          <MobileNavItem
            icon={<Settings size={24} />}
            label="CONFIG"
            active={currentView === "settings"}
            onClick={navToSettings}
          />
        </nav>
      </main>

      {/* ── Modals ─────────────────────────────────────────────── */}
      {isNewVehicleOpen && <VehicleModal />}
      {isNewFuelLogOpen && <FuelLogModal />}
      {isNewServiceLogOpen && <ServiceLogModal />}
      {isNewTireLogOpen && <TireLogModal />}
      {isNewReclaimOpen && <ReclaimModal />}

      <Toaster />
    </div>
  );
}
