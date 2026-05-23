import { useMemo, useCallback } from "react";
import { useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";

export function useReclaim({ user, firestore, toast, selectedVehicleId, handleCloseReclaim }) {
  const reclaimQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedVehicleId) return null;
    return collection(firestore, "userProfiles", user.uid, "vehicles", selectedVehicleId, "reclaimEntries");
  }, [firestore, user?.uid, selectedVehicleId]);

  const { data: reclaimEntriesData } = useCollection(reclaimQuery);
  const reclaimEntries = useMemo(() => reclaimEntriesData || [], [reclaimEntriesData]);

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

  return {
    reclaimEntries,
    handleAddReclaim
  };
}
