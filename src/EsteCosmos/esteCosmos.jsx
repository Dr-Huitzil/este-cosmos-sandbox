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
    selectedVehicleId,
    activeTab,
    analyticsRange,
    isDarkMode,
    isFull,
    isReimbursable,
    isUpdating,
    isNewVehicleOpen,
    isNewFuelLogOpen,
    isNewServiceLogOpen,
    isNewTireLogOpen,
    isMobileFabOpen,
    vehicles,
    fuelEntries,
    serviceEntries,
    tireEntries,
    selectedVehicle,
    oilHealth,
    thrusterHealth,
    alerts,
    fuelEfficiencyData,
    maintenanceSpendData,
    reimbursementStats,
    navToDashboard,
    navToLogs,
    navToAnalytics,
    navToSettings,
    handleSelectVehicle,
    handleSetActiveTab,
    handleOpenNewVehicle,
    handleCloseNewVehicle,
    handleOpenFuelLog,
    handleCloseFuelLog,
    handleCloseServiceLog,
    handleCloseTireLog,
    handleToggleFab,
    fabOpenFuel,
    fabOpenService,
    fabOpenVehicle,
    toggleTheme,
    handleSignOut,
    handleChangeRange,
    handleIsFull,
    handleIsReimbursable,
    handleAddVehicle,
    handleAddFuelLog,
    handleAddServiceLog,
    handleAddTireLog,
    handleUpdateProfile,
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
            <span className={styles.brandLine1}>ROMANCE</span>
            <span className={styles.brandLine2}>DAWN</span>
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
            <h1 className={styles.mobileBrandTitle}>ROMANCE DAWN</h1>
          </div>
          <div className={styles.topBarActions}>
            <button
              className={`${styles.retroBtn} ${styles.iconBtn}`}
              onClick={toggleTheme}
            >
              {isDarkMode ? (
                <Sun size={24} className={styles.sunIcon} />
              ) : (
                <Moon size={24} className={styles.moonIcon} />
              )}
            </button>
            <button
              className={`${styles.retroBtn} ${styles.refuelBtn}`}
              onClick={handleOpenFuelLog}
            >
              <Zap size={16} /> REFUEL
            </button>
          </div>
        </header>

        <div className={styles.viewContainer}>
          {currentView === "dashboard" && (
            <DashboardView
              alerts={alerts}
              vehicles={vehicles}
              fuelEntries={fuelEntries}
              selectedVehicleId={selectedVehicleId}
              selectedVehicle={selectedVehicle}
              serviceEntries={serviceEntries}
              tireEntries={tireEntries}
              activeTab={activeTab}
              oilHealth={oilHealth}
              thrusterHealth={thrusterHealth}
              onSetActiveTab={handleSetActiveTab}
              onOpenNewVehicle={handleOpenNewVehicle}
              onSelectVehicle={handleSelectVehicle}
            />
          )}
          {currentView === "logs" && (
            <LogsView
              fuelEntries={fuelEntries}
              serviceEntries={serviceEntries}
            />
          )}
          {currentView === "analytics" && (
            <AnalyticsView
              analyticsRange={analyticsRange}
              onChangeRange={handleChangeRange}
              fuelEfficiencyData={fuelEfficiencyData}
              maintenanceSpendData={maintenanceSpendData}
              reimbursementStats={reimbursementStats}
            />
          )}
          {currentView === "settings" && (
            <SettingsView
              user={user}
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
              onSignOut={handleSignOut}
              onUpdateProfile={handleUpdateProfile}
              isUpdating={isUpdating}
            />
          )}
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
                  <Wrench size={16} /> LOG REFIT
                </button>
                <button className={styles.fabMenuItem} onClick={fabOpenVehicle}>
                  {" "}
                  <Rocket size={16} /> ENLIST SHIP
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
      {isNewVehicleOpen && (
        <VehicleModal
          onClose={handleCloseNewVehicle}
          onSubmit={handleAddVehicle}
        />
      )}
      {isNewFuelLogOpen && (
        <FuelLogModal
          onClose={handleCloseFuelLog}
          onSubmit={handleAddFuelLog}
          isFull={isFull}
          onIsFull={handleIsFull}
        />
      )}
      {isNewServiceLogOpen && (
        <ServiceLogModal
          onClose={handleCloseServiceLog}
          onSubmit={handleAddServiceLog}
          isReimbursable={isReimbursable}
          onIsReimbursable={handleIsReimbursable}
        />
      )}
      {isNewTireLogOpen && (
        <TireLogModal
          onClose={handleCloseTireLog}
          onSubmit={handleAddTireLog}
        />
      )}

      <Toaster />
    </div>
  );
}
