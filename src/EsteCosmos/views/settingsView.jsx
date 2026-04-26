import { memo } from "react";
import { useFuelTracker, isSafePhotoURL } from "../../hooks/useEsteCosmos";
import sharedStyles from "../esteCosmos.module.css";
import ownStyles from "./settingsView.module.css";
const styles = { ...sharedStyles, ...ownStyles };

/**
 * Settings view — pilot identity, theme toggle, sign out.
 */
export const SettingsView = memo(function SettingsView() {
  const {
    user,
    isDarkMode,
    toggleTheme,
    handleSignOut,
    handleUpdateProfile,
    isUpdating,
    handleMigrateMPG,
  } = useFuelTracker();

  return (
    <div className={styles.viewPad}>
      <h2 className={styles.viewTitle}>
        APP<span className={styles.viewTitleSecondary}>CONFIG</span>
      </h2>

      <div className={styles.settingsGrid}>
        {/* Pilot Identity */}
        <div className={`${styles.retroCard} ${styles.settingsCard}`}>
          <h3 className={styles.settingsCardTitle}>USER IDENTITY</h3>
          <div className={styles.pilotRow}>
            <div className={styles.avatarWrap}>
              {isSafePhotoURL(user.photoURL) ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Pilot"}
                  className={styles.avatarImg}
                />
              ) : (
                <div className={styles.avatarFallback}>
                  {(user.displayName?.charAt(0) || "P").toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h4 className={styles.pilotName}>
                {user.displayName || "PILOT"}
              </h4>
              <p className={styles.pilotEmail}>{user.email}</p>
            </div>
          </div>
          <form onSubmit={handleUpdateProfile} className={styles.settingsForm}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>DISPLAY NAME</label>
              <input
                name="displayName"
                defaultValue={user.displayName || ""}
                className={styles.input}
              />
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className={`${styles.retroBtn} ${styles.updateBtn}`}
            >
              {isUpdating ? "UPDATING..." : "UPDATE SIGNAL"}
            </button>
          </form>
        </div>

        {/* Visual Filters */}
        <div
          className={`${styles.retroCard} ${styles.settingsCard} ${styles.settingsCardSecondary}`}
        >
          <h3 className={styles.settingsCardTitle}>VISUAL FILTERS</h3>
          <div className={styles.themeRow}>
            <div>
              <p className={styles.themeLabel}>DARK MODE</p>
              <p className={styles.themeSubLabel}>Toggle Night Watch Mode</p>
            </div>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className={styles.toggleTrack}>
                <span className={styles.toggleThumb} />
              </span>
            </label>
          </div>
        </div>

        {/* Database Calibration */}
        <div
          className={`${styles.retroCard} ${styles.settingsCard} ${styles.settingsCardSecondary}`}
        >
          <h3 className={styles.settingsCardTitle}>SYSTEM MAINTENANCE</h3>
          <p className={styles.themeSubLabel} style={{ marginBottom: "1rem" }}>
            Identify and correct historical fuel logs with inaccurate telemetry.
          </p>
          <button
            onClick={handleMigrateMPG}
            className={`${styles.retroBtn} ${styles.updateBtn}`}
          >
            RUN CALIBRATION
          </button>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className={`${styles.retroBtn} ${styles.signOutBtn}`}
        >
          LEAVE STATION
        </button>
      </div>
    </div>
  );
});
