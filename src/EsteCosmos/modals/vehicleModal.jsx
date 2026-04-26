import { memo, useState, useEffect } from "react";
import styles from "../esteCosmos.module.css";
import { useFuelTracker } from "../../hooks/useEsteCosmos";

/**
 * Modal to add a new vehicle with EPA API integration for Year -> Make -> Model
 */
export const VehicleModal = memo(function VehicleModal() {
  const { handleCloseNewVehicle, handleAddVehicle } = useFuelTracker();

  const [availableYears, setAvailableYears] = useState([]);
  const [availableMakes, setAvailableMakes] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);

  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const [loading, setLoading] = useState({
    years: false,
    makes: false,
    models: false,
  });

  // Fetch Years on mount
  useEffect(() => {
    const fetchYears = async () => {
      setLoading((prev) => ({ ...prev, years: true }));
      try {
        const res = await fetch(
          "https://www.fueleconomy.gov/ws/rest/vehicle/menu/year",
          {
            headers: { Accept: "application/json" },
          },
        );
        const data = await res.json();
        // Handle both single item and array responses from the API
        const items = Array.isArray(data.menuItem)
          ? data.menuItem
          : data.menuItem
            ? [data.menuItem]
            : [];
        setAvailableYears(items);
      } catch (error) {
        console.error("Error fetching years:", error);
      } finally {
        setLoading((prev) => ({ ...prev, years: false }));
      }
    };
    fetchYears();
  }, []);

  // Fetch Makes when Year changes
  useEffect(() => {
    if (!year) {
      setAvailableMakes([]);
      setMake("");
      return;
    }
    const fetchMakes = async () => {
      setLoading((prev) => ({ ...prev, makes: true }));
      try {
        const res = await fetch(
          `https://www.fueleconomy.gov/ws/rest/vehicle/menu/make?year=${year}`,
          {
            headers: { Accept: "application/json" },
          },
        );
        const data = await res.json();
        const items = Array.isArray(data.menuItem)
          ? data.menuItem
          : data.menuItem
            ? [data.menuItem]
            : [];
        setAvailableMakes(items);
      } catch (error) {
        console.error("Error fetching makes:", error);
      } finally {
        setLoading((prev) => ({ ...prev, makes: false }));
      }
    };
    fetchMakes();
  }, [year]);

  // Fetch Models when Make changes
  useEffect(() => {
    if (!make) {
      setAvailableModels([]);
      setModel("");
      return;
    }
    const fetchModels = async () => {
      setLoading((prev) => ({ ...prev, models: true }));
      try {
        const res = await fetch(
          `https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=${year}&make=${make}`,
          {
            headers: { Accept: "application/json" },
          },
        );
        const data = await res.json();
        const items = Array.isArray(data.menuItem)
          ? data.menuItem
          : data.menuItem
            ? [data.menuItem]
            : [];
        setAvailableModels(items);
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setLoading((prev) => ({ ...prev, models: false }));
      }
    };
    fetchModels();
  }, [make, year]);

  return (
    <div className={styles.modalOverlay} onClick={handleCloseNewVehicle}>
      <div
        className={`${styles.retroCard} ${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>ENLIST VEHICLE</h2>
        <form onSubmit={handleAddVehicle} className={styles.modalForm}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>VEHICLE NAME</label>
            <input
              name="name"
              placeholder="THOUSAND SUNNY"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>YEAR (ERA)</label>
            <select
              name="year"
              required
              className={styles.select}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">
                {loading.years ? "SCANNING YEARS..." : "SELECT YEAR"}
              </option>
              {availableYears.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.text}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>MAKE</label>
              <select
                name="make"
                required
                className={styles.select}
                value={make}
                onChange={(e) => setMake(e.target.value)}
                disabled={!year || loading.makes}
              >
                <option value="">
                  {!year
                    ? "AWAITING YEAR"
                    : loading.makes
                      ? "SCANNING..."
                      : "SELECT MAKE"}
                </option>
                {availableMakes.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.text}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>MODEL</label>
              <select
                name="model"
                required
                className={styles.select}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!make || loading.models}
              >
                <option value="">
                  {!make
                    ? "AWAITING MAKE"
                    : loading.models
                      ? "SCANNING..."
                      : "SELECT MODEL"}
                </option>
                {availableModels.map((md) => (
                  <option key={md.value} value={md.value}>
                    {md.text}
                  </option>
                ))}
              </select>
            </div>
          </div>


          <button
            type="submit"
            className={`${styles.retroBtn} ${styles.modalSubmitSecondary}`}
          >
            COMMISSION VEHICLE
          </button>
        </form>
      </div>
    </div>
  );
});
