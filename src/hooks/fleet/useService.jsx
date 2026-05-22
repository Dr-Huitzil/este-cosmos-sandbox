import { useMemo, useCallback } from "react";
import { useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";

export function useService({ user, firestore, toast, selectedVehicleId, isReimbursable, handleCloseServiceLog }) {
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

  return {
    serviceEntries,
    sortedServiceEntries,
    handleAddServiceLog
  };
}
