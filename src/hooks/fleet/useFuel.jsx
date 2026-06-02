import { useMemo, useEffect, useRef, useCallback } from "react";
import { useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { calculateMPG, parseLocalDate } from "../../util/fuel-utils";
import { getFunctions, httpsCallable } from "firebase/functions";

export function useFuel({ user, firestore, toast, selectedVehicleId, isFull, isAiAuthorized, handleCloseFuelLog }) {
  const fuelQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedVehicleId) return null;
    return collection(firestore, "userProfiles", user.uid, "vehicles", selectedVehicleId, "fuelEntries");
  }, [firestore, user?.uid, selectedVehicleId]);

  const { data: fuelEntriesData } = useCollection(fuelQuery);
  const fuelEntries = useMemo(() => fuelEntriesData || [], [fuelEntriesData]);

  const sortedFuelEntries = useMemo(
    () =>
      [...fuelEntries].sort((a, b) => {
        const d1 = new Date(b.day).getTime();
        const d2 = new Date(a.day).getTime();
        if (d1 !== d2) return d1 - d2;
        return (b.odometer || 0) - (a.odometer || 0);
      }),
    [fuelEntries]
  );

  const fuelEntriesRef = useRef(fuelEntries);
  const sortedFuelEntriesRef = useRef(sortedFuelEntries);
  useEffect(() => {
    fuelEntriesRef.current = fuelEntries;
    sortedFuelEntriesRef.current = sortedFuelEntries;
  }, [fuelEntries, sortedFuelEntries]);

  const handleAddFuelLog = useCallback(
    async (e) => {
      e.preventDefault();
      if (!user || !firestore || !selectedVehicleId) return;
      const fd = new FormData(e.currentTarget);
      const odo = parseInt(fd.get("odometer"));
      const qty = parseFloat(fd.get("quantity"));
      const day = fd.get("day");

      if (!Number.isFinite(odo) || odo < 0 || odo > 9_999_999) {
        toast({ variant: "destructive", title: "Invalid Odometer", description: "Must be a number between 0 and 9,999,999." });
        return;
      }
      if (!Number.isFinite(qty) || qty <= 0 || qty > 9_999) {
        toast({ variant: "destructive", title: "Invalid Quantity", description: "Fuel quantity must be between 0 and 9,999." });
        return;
      }
      if (!day) {
        toast({ variant: "destructive", title: "Missing Date", description: "Please select a fill-up date." });
        return;
      }

      const station = String(fd.get("gasStation") ?? "").trim().slice(0, 100);
      let totalPrice = parseFloat(fd.get("totalPrice"));
      let fuelPrice = parseFloat(fd.get("fuelPrice"));
      if (isNaN(fuelPrice) && !isNaN(totalPrice) && qty > 0) fuelPrice = Number((totalPrice / qty).toFixed(3));
      else if (isNaN(totalPrice) && !isNaN(fuelPrice) && qty > 0) totalPrice = Number((fuelPrice * qty).toFixed(2));

      // Calculate the standard mileage mapping
      const mileage = calculateMPG({ odometer: odo, fuelQuantity: qty, isFull }, sortedFuelEntriesRef.current);

      // AI Middleman Step
      let previousOdometer = odo;
      let previousDay = day;
      let hasPreviousLog = false;
      const allEntries = sortedFuelEntriesRef.current; // Use sorted array for correct chronological logic

      if (allEntries && allEntries.length > 0) {
        // Since allEntries is already sorted newest first, index 0 is the most recent
        const prevDoc = allEntries[0];
        previousOdometer = Number(prevDoc.odometer);
        previousDay = prevDoc.day;
        hasPreviousLog = true;
      }

      let mpg = 0;
      let miles_per_day = 0;

      if (hasPreviousLog) {
        const milesDriven = odo - previousOdometer;

        // SECURED DATE MATH: Use parseLocalDate for robust calendar day calculation
        const dateCurrent = parseLocalDate(day);
        const datePrevious = parseLocalDate(previousDay);
        const diffTime = Math.abs(dateCurrent - datePrevious);
        const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Safety check for same-day fill-ups (daysPassed = 0)
        const safeDays = Math.max(daysPassed, 1);

        // Prevent division by zero and negative mileage edge cases
        if (qty > 0 && milesDriven >= 0) {
          mpg = Number((milesDriven / qty).toFixed(2));
          miles_per_day = Number((milesDriven / safeDays).toFixed(2));
        }
      }

      // Run AI Model (ONLY if authorized)
      let anomalyScore = 0;
      if (isAiAuthorized) {
        // DEBUGGING LOGS: Inspect values before classifier run
        console.log("--- AI MODEL INPUT DEBUG ---");
        console.log("Calculated MPG:", mpg);
        console.log("Fuel Quantity (qty):", qty);
        console.log("Miles Per Day:", miles_per_day);

        // ARRAY ORDER FIXED: WASM model expects alphabetical [fuelQuantity, miles_per_day, mpg]
        const features = [qty, miles_per_day, mpg];
        console.log("Final Feature Array:", features);
        console.log("----------------------------");

        try {
          const functions = getFunctions();
          const getAnomalyScore = httpsCallable(functions, "getAnomalyScore");
          const aiResult = await getAnomalyScore({ features });
          anomalyScore = aiResult?.data?.anomalyScore || 0;

          if (anomalyScore < 0.6) {
            toast({ title: "Engine Optimal", description: `Anomaly Score: ${anomalyScore.toFixed(3)}` });
          } else {
            toast({ variant: "destructive", title: "Efficiency Degradation", description: `Anomaly Score: ${anomalyScore.toFixed(3)}` });
          }
        } catch (aiError) {
          console.error("Non-fatal error: AI Model failed to run:", aiError);
        }
      }

      const colRef = collection(firestore, "userProfiles", user.uid, "vehicles", selectedVehicleId, "fuelEntries");
      addDocumentNonBlocking(colRef, {
        vehicleId: selectedVehicleId,
        day, odometer: odo, fuelQuantity: qty, fuelPrice: fuelPrice || 0,
        totalPrice: totalPrice || 0, gasStation: station, isFull, mileage,
        anomalyScore: isAiAuthorized ? anomalyScore : null,
        createdAt: serverTimestamp()
      });
      handleCloseFuelLog();
      e.currentTarget.reset();
      toast({ title: "LOGGED", description: "Telemetry archived." });
    },
    [user, firestore, selectedVehicleId, isFull, toast, handleCloseFuelLog, isAiAuthorized]
  );

  const handleMigrateMPG = useCallback(async () => {
    if (!user || !firestore || !selectedVehicleId) return;
    toast({ title: "CALIBRATION STARTED", description: "Recalculating telemetry vectors..." });
    try {
      // sort newest-first to match calculateMPG requirements
      const allEntriesNewestFirst = [...fuelEntries].sort((a, b) => (b.odometer || 0) - (a.odometer || 0));

      const batch = writeBatch(firestore);
      let writes = 0;
      for (const entry of allEntriesNewestFirst) {
        const newMPG = calculateMPG(entry, allEntriesNewestFirst);
        if (entry.mileage !== newMPG) {
          const docRef = doc(firestore, "userProfiles", user.uid, "vehicles", selectedVehicleId, "fuelEntries", entry.id);
          batch.update(docRef, { mileage: newMPG });
          writes++;
        }
      }
      if (writes > 0) await batch.commit();
      toast({ title: "CALIBRATION COMPLETE", description: "Historical telemetry normalized." });
    } catch (err) {
      toast({ variant: "destructive", title: "CALIBRATION FAILED", description: "Neural link interrupted." });
      console.error(err);
    }
  }, [user, firestore, selectedVehicleId, fuelEntries, toast]);

  return {
    fuelEntries,
    sortedFuelEntries,
    handleAddFuelLog,
    handleMigrateMPG
  };
}
