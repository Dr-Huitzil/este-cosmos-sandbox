import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useToast } from "@/hooks/use-toast";
import { useUI } from "./UIContext";

import { useVehicles } from "../hooks/fleet/useVehicles";
import { useFuel } from "../hooks/fleet/useFuel";
import { useService } from "../hooks/fleet/useService";
import { useTires } from "../hooks/fleet/useTires";
import { useReclaim } from "../hooks/fleet/useReclaim";

const FleetContext = createContext(null);

export function FleetProvider({ children }) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const auth = useAuth(); // unused but keeping it for consistency if needed later
  
  const { 
    handleCloseNewVehicle, 
    handleCloseFuelLog, 
    handleCloseServiceLog, 
    handleCloseTireLog, 
    handleCloseReclaim 
  } = useUI();

  const [isFull, setIsFull] = useState(true);
  const [isReimbursable, setIsReimbursable] = useState(false);

  const [isAiAuthorized, setIsAiAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      const functions = getFunctions();
      const checkAiAuthorization = httpsCallable(functions, "checkAiAuthorization");
      checkAiAuthorization()
        .then((result) => {
          if (isMounted && result.data && result.data.isAuthorized) {
            setIsAiAuthorized(true);
          }
        })
        .catch((error) => {
          console.error("Failed to check AI authorization:", error);
          if (isMounted) setIsAiAuthorized(false);
        });
    } else {
      setIsAiAuthorized(false);
    }
    return () => { isMounted = false; };
  }, [user]);

  const handleIsFull = useCallback((e) => setIsFull(e.target.checked), []);
  const handleIsReimbursable = useCallback((e) => setIsReimbursable(e.target.checked), []);

  const {
    selectedVehicleId,
    selectedVehicle,
    vehicles,
    handleSelectVehicle,
    handleAddVehicle
  } = useVehicles({ user, firestore, toast, handleCloseNewVehicle });

  const {
    fuelEntries,
    sortedFuelEntries,
    handleAddFuelLog,
    handleMigrateMPG
  } = useFuel({ user, firestore, toast, selectedVehicleId, isFull, isAiAuthorized, handleCloseFuelLog });

  const {
    serviceEntries,
    sortedServiceEntries,
    handleAddServiceLog
  } = useService({ user, firestore, toast, selectedVehicleId, isReimbursable, handleCloseServiceLog });

  const {
    tireEntries,
    sortedTireEntries,
    handleAddTireLog
  } = useTires({ user, firestore, toast, selectedVehicleId, handleCloseTireLog });

  const {
    reclaimEntries,
    handleAddReclaim
  } = useReclaim({ user, firestore, toast, selectedVehicleId, handleCloseReclaim });

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
