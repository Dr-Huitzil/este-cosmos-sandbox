import React, { useMemo } from "react";
import { initializeFirebase, FirebaseProvider } from "@/firebase";
import { ToastProvider } from "@/hooks/use-toast";
import { Toaster } from "@/ui/toaster";
import EsteCosmosWindow from "../EsteCosmos/esteCosmos";

function App() {
  const sdk = useMemo(() => initializeFirebase(), []);

  return (
    <ToastProvider>
      <FirebaseProvider {...sdk}>
        <EsteCosmosWindow />
        <Toaster />
      </FirebaseProvider>
    </ToastProvider>
  );
}

export default App;
