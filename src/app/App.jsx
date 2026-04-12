import React, { useMemo } from "react";

import { initializeFirebase, FirebaseProvider } from "@/firebase";
import { ToastProvider } from "@/hooks/use-toast";
import { Toaster } from "@/ui/toaster";
import { FuelTrackerProvider } from "../hooks/useEsteCosmos";
import EsteCosmosWindow from "../EsteCosmos/esteCosmos";

function App() {
  const sdk = useMemo(() => initializeFirebase(), []);

  return (
    <ToastProvider>
      <FirebaseProvider {...sdk}>
        <FuelTrackerProvider>
          <EsteCosmosWindow />
        </FuelTrackerProvider>
        <Toaster />
      </FirebaseProvider>
    </ToastProvider>
  );
}

export default App;
