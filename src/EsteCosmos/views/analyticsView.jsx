import { memo } from "react";
import {
  Line,
  LineChart as ReChartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReChartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { DATE_RANGES } from "../../util/constants";
import { formatCurrency } from "../../util/fuel-utils";
import sharedStyles from "../esteCosmos.module.css";
import ownStyles from "./analyticsView.module.css";
const styles = { ...sharedStyles, ...ownStyles };

import { useFuelTracker } from "../../hooks/useEsteCosmos";

/**
 * Analytics view — efficiency line chart, maintenance spend pie chart, bounty reclaim stats.
 */
export const AnalyticsView = memo(function AnalyticsView() {
  const {
    analyticsRange,
    handleChangeRange,
    fuelEfficiencyData,
    maintenanceSpendData,
    reimbursementStats,
  } = useFuelTracker();

  return (
    <div className={styles.viewPad}>
      <div className={styles.analyticsTopRow}>
        <h2 className={styles.viewTitle}>
          SYSTEM<span className={styles.viewTitleSecondary}>STATS</span>
        </h2>
        <select
          className={styles.rangeSelect}
          value={analyticsRange}
          onChange={handleChangeRange}
        >
          {DATE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.analyticsGrid}>
        <div className={`${styles.retroCard} ${styles.chartCard}`}>
          <h3 className={styles.chartTitle}>EFFICIENCY PROPAGATION</h3>
          <div className={styles.chartArea}>
            {fuelEfficiencyData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReChartsLineChart data={fuelEfficiencyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#000000"
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontWeight: "bold", fontSize: 10 }}
                  />
                  <YAxis tick={{ fontWeight: "bold", fontSize: 10 }} />
                  <ReChartsTooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "4px solid #000",
                      borderRadius: 0,
                      boxShadow: "8px 8px 0px #000",
                    }}
                    labelStyle={{
                      fontWeight: 900,
                      color: "hsl(var(--primary))",
                    }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="mpg"
                    stroke="hsl(var(--primary))"
                    strokeWidth={6}
                    dot={{ r: 8, fill: "#000" }}
                  />
                </ReChartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.chartEmpty}>
                <p>Insufficient Telemetry Data</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.analyticsBottomRow}>
          <div className={`${styles.retroCard} ${styles.pieCard}`}>
            <h3 className={styles.chartTitle}>CREDIT ALLOCATION</h3>
            <div className={styles.pieArea}>
              {maintenanceSpendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={maintenanceSpendData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      stroke="#000"
                      strokeWidth={4}
                    >
                      {maintenanceSpendData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            i % 2 === 0
                              ? "hsl(var(--primary))"
                              : "hsl(var(--secondary))"
                          }
                        />
                      ))}
                    </Pie>
                    <ReChartsTooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{
                        fontWeight: 900,
                        fontSize: "10px",
                        textTransform: "uppercase",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.chartEmpty}>
                  <p>No Refit Expenditure Data</p>
                </div>
              )}
            </div>
          </div>

          <div className={`${styles.retroCard} ${styles.bountyCard}`}>
            <h3 className={`${styles.chartTitle} ${styles.bountyTitle}`}>
              BERRY RECLAIM
            </h3>
            <div className={styles.bountyRows}>
              <div className={styles.bountyRow}>
                <span className={styles.bountyLabel}>GROSS EXPENDITURE</span>
                <span className={styles.bountyAmount}>
                  {formatCurrency(reimbursementStats.total)}
                </span>
              </div>
              <div className={styles.bountyRow}>
                <span className={styles.bountyLabel}>COMMISSION RECLAIM</span>
                <span
                  className={`${styles.bountyAmount} ${styles.bountyReclaim}`}
                >
                  +{formatCurrency(reimbursementStats.reimbursed)}
                </span>
              </div>
              <div className={`${styles.bountyRow} ${styles.bountyNetRow}`}>
                <span className={styles.bountyNetLabel}>NET VOID LOSS</span>
                <span className={styles.bountyNet}>
                  {formatCurrency(reimbursementStats.net)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
