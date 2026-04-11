import React from "react";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast() || { toasts: [] };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            padding: "1rem",
            backgroundColor:
              t.variant === "destructive" ? "#ef4444" : "#10b981",
            color: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            minWidth: "200px",
          }}
        >
          {t.title && <div style={{ fontWeight: "bold" }}>{t.title}</div>}
          {t.description && (
            <div style={{ fontSize: "0.875rem" }}>{t.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
