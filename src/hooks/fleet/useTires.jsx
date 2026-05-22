import { useMemo, useCallback } from "react";
import { useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";

export function useTires({ user, firestore, toast, selectedVehicleId, handleCloseTireLog }) {
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

  return {
    tireEntries,
    sortedTireEntries,
    handleAddTireLog
  };
}
