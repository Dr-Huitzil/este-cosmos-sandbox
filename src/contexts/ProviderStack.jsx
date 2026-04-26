import React from "react";
import { UIProvider } from "./UIContext";
import { FleetProvider } from "./FleetContext";
import { AnalyticsProvider } from "./AnalyticsContext";

export function ProviderStack({ children }) {
  return (
    <UIProvider>
      <FleetProvider>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </FleetProvider>
    </UIProvider>
  );
}
