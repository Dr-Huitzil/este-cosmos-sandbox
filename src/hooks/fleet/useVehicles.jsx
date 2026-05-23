import { useState, useMemo, useEffect, useCallback } from "react";
import { useCollection, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";

export function useVehicles({ user, firestore, toast, handleCloseNewVehicle }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

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

  const handleSelectVehicle = useCallback((id) => setSelectedVehicleId(id), []);

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

  return {
    selectedVehicleId,
    selectedVehicle,
    vehicles,
    handleSelectVehicle,
    handleAddVehicle
  };
}
