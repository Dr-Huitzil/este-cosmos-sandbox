import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { useFleet } from "./FleetContext";
import { calculateHealth, calculateMPG } from "../util/fuel-utils";

const AnalyticsContext = createContext(null);

const parseLocalDate = (dateString) => {
  if (!dateString) return new Date(0);
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day);
};

export function AnalyticsProvider({ children }) {
  const {
    selectedVehicle,
    fuelEntries,
    serviceEntries,
    reclaimEntries,
    sortedFuelEntries,
    sortedServiceEntries,
    sortedTireEntries,
    isAiAuthorized
  } = useFleet();

  const [analyticsRange, setAnalyticsRange] = useState("14");
  const handleChangeRange = useCallback((e) => setAnalyticsRange(e.target.value), []);

  const shortDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }),
    []
  );

  const oilHealth = useMemo(
    () => calculateHealth(sortedServiceEntries, "Oil Change", 5000, sortedFuelEntries),
    [sortedServiceEntries, sortedFuelEntries]
  );
  
  const thrusterHealth = useMemo(
    () => calculateHealth(sortedServiceEntries, "Tire Rotation", 7500, sortedFuelEntries),
    [sortedServiceEntries, sortedFuelEntries]
  );

  const alerts = useMemo(() => {
    const list = [];
    if (!selectedVehicle) return list;

    if (oilHealth < 20) {
      list.push({
        id: "oil",
        title: oilHealth <= 0 ? "CRITICAL: ENGINE FAILURE" : "WARNING: LOW ENGINE INTEGRITY",
        description: `Engine health at ${oilHealth}%. Immediate service required.`,
        variant: oilHealth <= 0 ? "destructive" : "warning",
      });
    }

    if (sortedTireEntries.length >= 1) {
      const latest = sortedTireEntries[0];
      const lowTires = [
        { name: "PF", val: latest.frontLeft },
        { name: "SF", val: latest.frontRight },
        { name: "PA", val: latest.rearLeft },
        { name: "SA", val: latest.rearRight },
      ].filter((p) => p.val < 28);
      if (lowTires.length > 0) {
        list.push({
          id: "tire-leak",
          title: "TIRE LEAK DETECTED",
          description: `Low pressure detected in: ${lowTires.map((t) => t.name).join(", ")}.`,
          variant: "destructive",
        });
      }
    }
    return list;
  }, [selectedVehicle, oilHealth, sortedTireEntries]);

  const filteredFuel = useMemo(() => {
    if (analyticsRange === "all") return fuelEntries;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(analyticsRange));
    cutoff.setHours(0, 0, 0, 0);
    return fuelEntries.filter((e) => parseLocalDate(e.day) >= cutoff);
  }, [fuelEntries, analyticsRange]);

  const filteredService = useMemo(() => {
    if (analyticsRange === "all") return serviceEntries;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(analyticsRange));
    cutoff.setHours(0, 0, 0, 0);
    return serviceEntries.filter((e) => parseLocalDate(e.date) >= cutoff);
  }, [serviceEntries, analyticsRange]);

  const fuelEfficiencyData = useMemo(
    () => {
      // We need all fuel entries (not just filtered) for accurate MPG calculation
      // since calculateMPG looks backwards through history for the previous full fill-up
      const sorted = [...filteredFuel].sort(
        (a, b) => parseLocalDate(a.day).getTime() - parseLocalDate(b.day).getTime()
      );
      return sorted
        .map((e) => {
          // Prefer stored mileage; fall back to dynamic calculation if missing/zero
          const mpg = e.mileage > 0 ? e.mileage : calculateMPG(e, sortedFuelEntries, true);
          return { entry: e, mpg };
        })
        .filter(({ mpg }) => mpg > 0)
        .map(({ entry: e, mpg }) => ({
          date: shortDateFormatter.format(parseLocalDate(e.day)),
          mpg,
          anomalyScore: isAiAuthorized && e.anomalyScore ? Number(e.anomalyScore.toFixed(3)) : 0,
        }));
    },
    [filteredFuel, sortedFuelEntries, shortDateFormatter, isAiAuthorized]
  );

  const maintenanceSpendData = useMemo(() => {
    const categories = {};
    filteredService.forEach((s) => {
      categories[s.serviceType] = (categories[s.serviceType] || 0) + s.totalCost;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [filteredService]);

  const filteredReclaim = useMemo(() => {
    if (analyticsRange === "all") return reclaimEntries;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(analyticsRange));
    cutoff.setHours(0, 0, 0, 0);
    return reclaimEntries.filter((e) => parseLocalDate(e.day) >= cutoff);
  }, [reclaimEntries, analyticsRange]);

  const reimbursementStats = useMemo(() => {
    const total = filteredFuel.reduce((sum, f) => sum + (f.totalPrice || 0), 0);
    const reimbursed = filteredReclaim.reduce((sum, r) => sum + (r.amount || 0), 0);
    return { total, reimbursed, net: total - reimbursed };
  }, [filteredFuel, filteredReclaim]);

  const contextValue = React.useMemo(() => ({
    analyticsRange, handleChangeRange, oilHealth, thrusterHealth, alerts,
    fuelEfficiencyData, maintenanceSpendData, reimbursementStats, isAiAuthorized
  }), [
    analyticsRange, handleChangeRange, oilHealth, thrusterHealth, alerts,
    fuelEfficiencyData, maintenanceSpendData, reimbursementStats, isAiAuthorized
  ]);

  return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>;
}

export const useAnalytics = () => useContext(AnalyticsContext);
