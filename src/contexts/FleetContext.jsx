import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { calculateMPG, calculateDaysPassed } from "../util/fuel-utils";
import { runEdgeImpulseClassifier } from "../util/ai-model";
import { useUI } from "./UIContext";

const FleetContext = createContext(null);

export function FleetProvider({ children }) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  
  const { 
    currentView, 
    handleCloseNewVehicle, 
    handleCloseFuelLog, 
    handleCloseServiceLog, 
    handleCloseTireLog, 
    handleCloseReclaim 
  } = useUI();

  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [isFull, setIsFull] = useState(true);
  const [isReimbursable, setIsReimbursable] = useState(false);

  // Vehicles
  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "userProfiles", user.uid, "vehicles");
  }, [firestore, user?.uid]);
  const { data: vehiclesData } = useCollection(vehiclesQuery);
  const vehicles = useMemo(() => vehiclesData || [], [vehiclesData]);

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) ?? null,
    [vehicles, selectedVehicleId]
  );

  // Fuel Entries
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
  useEffect(() => {
    fuelEntriesRef.current = fuelEntries;
  }, [fuelEntries]);

  // Service Entries
  const serviceQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedVehicleId) return null;
    return collection(firestore, "userProfiles", user.uid, "vehicles", selectedVehicleId, "serviceEntries");
  }, [firestore, user?.uid, selectedVehicleId]);
  const { data: serviceEntriesData } = useCollection(serviceQuery);
  const serviceEntries = useMemo(() => serviceEntriesData || [], [serviceEntriesData]);

  const sortedServiceEntries = useMemo(
    () =>
      [...serviceEntries].sort((a, b) => {
        const d1 = new Date(b.date).getTime();
        const d2 = new Date(a.date).getTime();
        if (d1 !== d2) return d1 - d2;
        return (b.odometerReading || 0) - (a.odometerReading || 0);
      }),
    [serviceEntries]
  );

  // Tire Entries
  const tireQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedVehicleId) return null;
    return collection(firestore, "userProfiles", user.uid, "vehicles", selectedVehicleId, "tirePressureEntries");
  }, [firestore, user?.uid, selectedVehicleId]);
  const { data: tireEntriesData } = useCollection(tireQuery);
  const tireEntries = useMemo(() => tireEntriesData || [], [tireEntriesData]);

  const sortedTireEntries = useMemo(
    () => [...tireEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [tireEntries]
  );

  // Reclaim Entries
  const reclaimQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedVehicleId) return null;
    return collection(firestore, "userProfiles", user.uid, "vehicles", selectedVehicleId, "reclaimEntries");
  }, [firestore, user?.uid, selectedVehicleId]);
  const { data: reclaimEntriesData } = useCollection(reclaimQuery);
  const reclaimEntries = useMemo(() => reclaimEntriesData || [], [reclaimEntriesData]);

  const handleSelectVehicle = useCallback((id) => setSelectedVehicleId(id), []);
  const handleIsFull = useCallback((e) => setIsFull(e.target.checked), []);
  const handleIsReimbursable = useCallback((e) => setIsReimbursable(e.target.checked), []);

  const handleAddVehicle = useCallback(
    (e) => {
      e.preventDefault();
      if (!user || !firestore) return;
      const fd = new FormData(e.currentTarget);
      const make = String(fd.get("make") ?? "").trim().slice(0, 50);
      const model = String(fd.get("model") ?? "").trim().slice(0, 50);
      const year = parseInt(fd.get("year"));
      const name = String(fd.get("name") ?? "").trim().slice(0, 80);

      if (!make || !model) {
        toast({ variant: "destructive", title: "Missing Fields", description: "Make and model are required." });
        return;
      }
      if (!Number.isFinite(year) || year < 1900 || year > new Date().getFullYear() + 2) {
        toast({ variant: "destructive", title: "Invalid Year", description: "Enter a valid vehicle year." });
        return;
      }

      const vehicleRef = doc(collection(firestore, "userProfiles", user.uid, "vehicles"));
      const vehicleId = vehicleRef.id;
      const newVehicle = { id: vehicleId, make, model, year, name: name || `${year} ${make} ${model}` };
      setDocumentNonBlocking(vehicleRef, { ...newVehicle, createdAt: serverTimestamp() }, { merge: true });
      setSelectedVehicleId(vehicleId);
      handleCloseNewVehicle();
      e.currentTarget.reset();
      toast({ title: "SHIP REGISTERED", description: "Vessel signal locked in." });
    },
    [user, firestore, toast, handleCloseNewVehicle]
  );

  const isAiAuthorized = useMemo(() => {
    // Lock the AI feature to a specific UID (or UIDs)
    // You can set this in your .env.local as VITE_AI_AUTHORIZED_UID
    const authorizedUid = import.meta.env.VITE_AI_AUTHORIZED_UID;
    return user && user.uid === authorizedUid;
  }, [user]);

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
      const mileage = calculateMPG({ odometer: odo, fuelQuantity: qty, isFull }, fuelEntriesRef.current);
      
      // AI Middleman Step
      let previousOdometer = odo;
      let previousDay = day;
      let hasPreviousLog = false;
      const allEntries = fuelEntriesRef.current;
      
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
        const daysPassed = calculateDaysPassed(day, previousDay);
        
        // Safety check in case of multiple fuel-ups on the same day (daysPassed = 0)
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
        const features = [mpg, qty, miles_per_day];
        try {
          const aiResult = await runEdgeImpulseClassifier(features);
          anomalyScore = aiResult?.anomaly || 0;
          
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
    [user, firestore, selectedVehicleId, isFull, toast, handleCloseFuelLog]
  );

  const handleAddServiceLog = useCallback(
    (e) => {
      e.preventDefault();
      if (!user || !firestore || !selectedVehicleId) return;
      const fd = new FormData(e.currentTarget);
      const cost = parseFloat(fd.get("cost"));
      const odo = parseInt(fd.get("odometer"));

      if (!Number.isFinite(cost) || cost < 0 || cost > 999_999) {
        toast({ variant: "destructive", title: "Invalid Cost", description: "Cost must be a positive number up to 999,999." });
        return;
      }
      if (!Number.isFinite(odo) || odo < 0 || odo > 9_999_999) {
        toast({ variant: "destructive", title: "Invalid Odometer", description: "Must be between 0 and 9,999,999." });
        return;
      }

      const rAmount = isReimbursable ? parseFloat(fd.get("reimbursementAmount")) || 0 : 0;
      const colRef = collection(firestore, "userProfiles", user.uid, "vehicles", selectedVehicleId, "serviceEntries");
      addDocumentNonBlocking(colRef, {
        vehicleId: selectedVehicleId, date: fd.get("date"), odometerReading: odo,
        serviceType: String(fd.get("serviceType") ?? "").trim().slice(0, 100),
        description: String(fd.get("description") ?? "").trim().slice(0, 500),
        totalCost: cost, provider: String(fd.get("provider") ?? "").trim().slice(0, 100),
        reimbursable: isReimbursable, reimbursementAmount: rAmount, createdAt: serverTimestamp()
      });
      handleCloseServiceLog();
      e.currentTarget.reset();
      toast({ title: "ARCHIVED", description: "Refit telemetry confirmed." });
    },
    [user, firestore, selectedVehicleId, isReimbursable, toast, handleCloseServiceLog]
  );

  const handleAddTireLog = useCallback(
    (e) => {
      e.preventDefault();
      if (!user || !firestore || !selectedVehicleId) return;
      const fd = new FormData(e.currentTarget);
      const [fl, fr, rl, rr] = ["fl", "fr", "rl", "rr"].map((k) => parseFloat(fd.get(k)));

      if ([fl, fr, rl, rr].some((v) => !Number.isFinite(v) || v < 0 || v > 200)) {
        toast({ variant: "destructive", title: "Invalid PSI", description: "All tire readings must be between 0 and 200 PSI." });
        return;
      }

      const colRef = collection(firestore, "userProfiles", user.uid, "vehicles", selectedVehicleId, "tirePressureEntries");
      addDocumentNonBlocking(colRef, {
        vehicleId: selectedVehicleId, date: new Date().toISOString(),
        frontLeft: fl, frontRight: fr, rearLeft: rl, rearRight: rr, unit: "PSI", createdAt: serverTimestamp()
      });
      handleCloseTireLog();
      e.currentTarget.reset();
      toast({ title: "SYNCED", description: "Hull scan complete." });
    },
    [user, firestore, selectedVehicleId, toast, handleCloseTireLog]
  );

  const handleAddReclaim = useCallback(
    (e) => {
      e.preventDefault();
      if (!user || !firestore || !selectedVehicleId) return;
      const fd = new FormData(e.currentTarget);
      const amount = parseFloat(fd.get("amount"));
      const day = fd.get("date");

      if (!Number.isFinite(amount) || amount <= 0 || amount > 99_999) {
        toast({ variant: "destructive", title: "Invalid Amount", description: "Reclaim amount must be between 0 and 99,999." });
        return;
      }
      if (!day) {
        toast({ variant: "destructive", title: "Missing Date", description: "Please select a reclaim date." });
        return;
      }

      const colRef = collection(firestore, "userProfiles", user.uid, "vehicles", selectedVehicleId, "reclaimEntries");
      const promise = addDocumentNonBlocking(colRef, {
        vehicleId: selectedVehicleId, day, amount,
        description: String(fd.get("description") ?? "").trim().slice(0, 500),
        createdAt: serverTimestamp()
      });
      promise.then(res => { if (res?.id) console.log("ADD DOC SUCCESS:", res.id); }).catch(err => console.error("ADD DOC ERROR:", err));
      handleCloseReclaim();
      e.currentTarget.reset();
      toast({ title: "LOGGED", description: "Berry deposit confirmed." });
    },
    [user, firestore, selectedVehicleId, toast, handleCloseReclaim]
  );

  const handleMigrateMPG = useCallback(async () => {
    if (!user || !firestore || !selectedVehicleId) return;
    toast({ title: "CALIBRATION STARTED", description: "Recalculating telemetry vectors..." });
    try {
      const allEntries = [...fuelEntries].sort((a, b) => (a.odometer || 0) - (b.odometer || 0));
      const batch = writeBatch(firestore);
      let writes = 0;
      for (const entry of allEntries) {
        const newMPG = calculateMPG(entry, allEntries);
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

  const contextValue = React.useMemo(() => ({
    selectedVehicleId, vehicles, fuelEntries, serviceEntries, tireEntries, reclaimEntries,
    selectedVehicle, sortedFuelEntries, sortedServiceEntries, sortedTireEntries,
    isFull, isReimbursable, isAiAuthorized, handleSelectVehicle, handleIsFull, handleIsReimbursable,
    handleAddVehicle, handleAddFuelLog, handleAddServiceLog, handleAddTireLog, handleAddReclaim, handleMigrateMPG
  }), [
    selectedVehicleId, vehicles, fuelEntries, serviceEntries, tireEntries, reclaimEntries,
    selectedVehicle, sortedFuelEntries, sortedServiceEntries, sortedTireEntries,
    isFull, isReimbursable, isAiAuthorized, handleSelectVehicle, handleIsFull, handleIsReimbursable,
    handleAddVehicle, handleAddFuelLog, handleAddServiceLog, handleAddTireLog, handleAddReclaim, handleMigrateMPG
  ]);

  return <FleetContext.Provider value={contextValue}>{children}</FleetContext.Provider>;
}

export const useFleet = () => useContext(FleetContext);
