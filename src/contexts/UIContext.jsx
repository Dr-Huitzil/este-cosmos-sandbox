import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const { toast } = useToast();
  const auth = useAuth();
  const rootRef = useRef(null);

  const [currentView, setCurrentView] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("fuel");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [isNewFuelLogOpen, setIsNewFuelLogOpen] = useState(false);
  const [isNewServiceLogOpen, setIsNewServiceLogOpen] = useState(false);
  const [isNewTireLogOpen, setIsNewTireLogOpen] = useState(false);
  const [isNewReclaimOpen, setIsNewReclaimOpen] = useState(false);
  const [isMobileFabOpen, setIsMobileFabOpen] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

  // Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  // Navigation
  const navToDashboard = useCallback(() => setCurrentView("dashboard"), []);
  const navToLogs = useCallback(() => setCurrentView("logs"), []);
  const navToAnalytics = useCallback(() => setCurrentView("analytics"), []);
  const navToSettings = useCallback(() => setCurrentView("settings"), []);

  const handleSetActiveTab = useCallback((tab) => setActiveTab(tab), []);

  // Modals
  const handleOpenNewVehicle = useCallback(() => setIsNewVehicleOpen(true), []);
  const handleCloseNewVehicle = useCallback(() => setIsNewVehicleOpen(false), []);
  const handleOpenFuelLog = useCallback(() => setIsNewFuelLogOpen(true), []);
  const handleCloseFuelLog = useCallback(() => setIsNewFuelLogOpen(false), []);
  const handleOpenServiceLog = useCallback(() => setIsNewServiceLogOpen(true), []);
  const handleCloseServiceLog = useCallback(() => setIsNewServiceLogOpen(false), []);
  const handleOpenTireLog = useCallback(() => setIsNewTireLogOpen(true), []);
  const handleCloseTireLog = useCallback(() => setIsNewTireLogOpen(false), []);
  const handleOpenReclaim = useCallback(() => setIsNewReclaimOpen(true), []);
  const handleCloseReclaim = useCallback(() => setIsNewReclaimOpen(false), []);
  const handleToggleFab = useCallback(() => setIsMobileFabOpen((v) => !v), []);

  const fabOpenFuel = useCallback(() => {
    setIsNewFuelLogOpen(true);
    setIsMobileFabOpen(false);
  }, []);
  const fabOpenService = useCallback(() => {
    setIsNewServiceLogOpen(true);
    setIsMobileFabOpen(false);
  }, []);
  const fabOpenVehicle = useCallback(() => {
    setIsNewVehicleOpen(true);
    setIsMobileFabOpen(false);
  }, []);
  const fabOpenReclaim = useCallback(() => {
    setIsNewReclaimOpen(true);
    setIsMobileFabOpen(false);
  }, []);

  // Auth actions
  const handleSignOut = useCallback(() => signOut(auth), [auth]);

  const handleUpdateProfile = useCallback(
    async (e) => {
      e.preventDefault();
      if (!auth.currentUser) {
        toast({
          variant: "destructive",
          title: "Not Authenticated",
          description: "Please sign in again.",
        });
        return;
      }
      const name = String(new FormData(e.currentTarget).get("displayName") ?? "").trim();
      if (!name) {
        toast({
          variant: "destructive",
          title: "Invalid Name",
          description: "Display name cannot be empty.",
        });
        return;
      }
      setIsUpdating(true);
      try {
        await updateProfile(auth.currentUser, { displayName: name.slice(0, 100) });
        toast({ title: "SIGNAL UPDATED" });
      } catch (err) {
        const friendlyError = err.code === 'auth/requires-recent-login' 
          ? 'For your security, please sign in again to update your profile.'
          : 'Failed to update signal. Please try again.';
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: friendlyError,
        });
        console.error('[Profile Update]', err);
      } finally {
        setIsUpdating(false);
      }
    },
    [auth, toast]
  );

  const contextValue = React.useMemo(() => ({
    rootRef,
    currentView,
    activeTab,
    isDarkMode,
    isNewVehicleOpen,
    isNewFuelLogOpen,
    isNewServiceLogOpen,
    isNewTireLogOpen,
    isNewReclaimOpen,
    isMobileFabOpen,
    isUpdating,
    toggleTheme,
    navToDashboard,
    navToLogs,
    navToAnalytics,
    navToSettings,
    handleSetActiveTab,
    handleOpenNewVehicle,
    handleCloseNewVehicle,
    handleOpenFuelLog,
    handleCloseFuelLog,
    handleOpenServiceLog,
    handleCloseServiceLog,
    handleOpenTireLog,
    handleCloseTireLog,
    handleOpenReclaim,
    handleCloseReclaim,
    handleToggleFab,
    fabOpenFuel,
    fabOpenService,
    fabOpenVehicle,
    fabOpenReclaim,
    handleSignOut,
    handleUpdateProfile
  }), [
    currentView, activeTab, isDarkMode, isNewVehicleOpen, isNewFuelLogOpen,
    isNewServiceLogOpen, isNewTireLogOpen, isNewReclaimOpen, isMobileFabOpen, isUpdating,
    toggleTheme, navToDashboard, navToLogs, navToAnalytics, navToSettings, handleSetActiveTab,
    handleOpenNewVehicle, handleCloseNewVehicle, handleOpenFuelLog, handleCloseFuelLog,
    handleOpenServiceLog, handleCloseServiceLog, handleOpenTireLog, handleCloseTireLog,
    handleOpenReclaim, handleCloseReclaim, handleToggleFab, fabOpenFuel, fabOpenService,
    fabOpenVehicle, fabOpenReclaim, handleSignOut, handleUpdateProfile
  ]);

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
