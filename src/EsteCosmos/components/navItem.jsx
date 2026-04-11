import { memo } from "react";
import styles from "./navItem.module.css";

/**
 * Sidebar desktop navigation item
 * @param {{ icon: React.ReactNode, label: string, active: boolean, onClick: function}} props
 */
export const NavItem = memo(function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
    >
      <span className={styles.navIcon}>{icon}</span>
      <span className={styles.navLabel}>{label}</span>
    </button>
  );
});

/**
 * Bottom mobile navigation item
 * @param {{icon: React.ReactNode, label: string, active: boolean, onClick: function}} props
 */
export const MobileNavItem = memo(function MobileNavItem({
  icon,
  label,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`${styles.mobileNavItem} ${active ? styles.mobileNavItemActive : ""}`}
    >
      {icon}
      <span className={styles.mobileNavLabel}>{label}</span>
    </button>
  );
});
