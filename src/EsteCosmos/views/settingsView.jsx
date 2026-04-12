import { memo } from "react";
import { isSafePhotoURL } from "../../hooks/useEsteCosmos";
import sharedStyles from "../esteCosmos.module.css";
import ownStyles from "./settingsView.module.css";
const styles = { ...sharedStyles, ...ownStyles };

/**
 * Settings view — pilot identity, theme toggle, sign out.
 */
export const SettingsView = memo(function SettingsView({
  user,
  isDarkMode,
  onToggleTheme,
  onSignOut,
  onUpdateProfile,
  isUpdating,
  onMigrateMPG,
}) {
  return (
    <div className={styles.viewPad}>
      <h2 className={styles.viewTitle}>
        FLEET<span className={styles.viewTitleSecondary}>CONFIG</span>
      </h2>

      <div className={styles.settingsGrid}>
        {/* Pilot Identity */}
        <div className={`${styles.retroCard} ${styles.settingsCard}`}>
          <h3 className={styles.settingsCardTitle}>PILOT IDENTITY</h3>
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
          <form onSubmit={onUpdateProfile} className={styles.settingsForm}>
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
              <p className={styles.themeLabel}>STARCHART OVERLAY</p>
              <p className={styles.themeSubLabel}>Toggle Night Watch Mode</p>
            </div>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={isDarkMode}
                onChange={onToggleTheme}
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
            onClick={onMigrateMPG}
            className={`${styles.retroBtn} ${styles.updateBtn}`}
          >
            RUN CALIBRATION
          </button>
        </div>

        {/* Sign out */}
        <button
          onClick={onSignOut}
          className={`${styles.retroBtn} ${styles.signOutBtn}`}
        >
          LEAVE STATION
        </button>
      </div>
    </div>
  );
});
