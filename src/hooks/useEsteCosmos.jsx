/* eslint-disable react-refresh/only-export-components */
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";
import { useToast } from "@/hooks/use-toast";
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  useAuth,
  setDocumentNonBlocking,
} from "@/firebase";
import {
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { signOut, updateProfile } from "firebase/auth";
import { calculateMPG, calculateHealth } from "../util/fuel-utils";
// ---------------------------------------------------------------------------
// Helper — validate that a user photo URL comes from a trusted Google domain.
// Exported so FuelTrackerWindow and SettingsView can both use it without
// duplicating the logic.
// ---------------------------------------------------------------------------
export function isSafePhotoURL(url) {
  if (!url) return false;
  try {
    const { protocol, hostname } = new URL(url);
    return (
      protocol === "https:" &&
      /\.(google|googleusercontent|googleapis|githubusercontent)\.com$/.test(
        hostname,
      )
    );
  } catch {
    return false;
  }
}
/**
 * useFuelTracker — central hook for FuelTrackerWindow.
 * Owns all state, Firebase subscriptions, derived memos, and stable callbacks.
 * Returns a flat object so the shell component can destructure what it needs.
 */
const FuelTrackerContext = createContext(null);

export function FuelTrackerProvider({ children }) {
  const { toast } = useToast();
  const { user, isUserLoading: firebaseLoading } = useUser();
  const [minLoadingDone, setMinLoadingDone] = useState(false);

  // ── Extend Preloader ──────────────────────────────────────────
  // Artificial delay to ensure the splash screen feels substantial
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingDone(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const isUserLoading = firebaseLoading || !minLoadingDone;
  const firestore = useFirestore();
  const auth = useAuth();

  // Ref attached to the widget root for scoped dark-mode class management
  const rootRef = useRef(null);

  // ── View / UI state ────────────────────────────────────────────
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [activeTab, setActiveTab] = useState("fuel");
  const [analyticsRange, setAnalyticsRange] = useState("90");

  // ── Modal open/close state ──────────────────────────────────────
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [isNewFuelLogOpen, setIsNewFuelLogOpen] = useState(false);
  const [isNewServiceLogOpen, setIsNewServiceLogOpen] = useState(false);
  const [isNewTireLogOpen, setIsNewTireLogOpen] = useState(false);
  const [isNewReclaimOpen, setIsNewReclaimOpen] = useState(false);
  const [isMobileFabOpen, setIsMobileFabOpen] = useState(false);

  // ── Form checkbox + async-op state ─────────────────────────────
  const [isFull, setIsFull] = useState(true);
  const [isReimbursable, setIsReimbursable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // profile update in-flight

  // ── Theme state ─────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialise dark mode from localStorage / system preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

  // Sync 'dark' class on HTML root whenever isDarkMode changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // ── Firebase — vehicles ─────────────────────────────────────────
  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "userProfiles", user.uid, "vehicles");
  }, [firestore, user?.uid]);
  const { data: vehiclesData } = useCollection(vehiclesQuery);
  const vehicles = vehiclesData || [];

  // Auto-select first vehicle once data arrives
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  // ── Firebase — fuel entries ─────────────────────────────────────
  // PERF: Not needed on settings view — gate it off to close the listener.
  const fuelQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedVehicleId || currentView === "settings")
      return null;
    return collection(
      firestore,
      "userProfiles",
      user.uid,
      "vehicles",
      selectedVehicleId,
      "fuelEntries",
    );
  }, [firestore, user?.uid, selectedVehicleId, currentView]);
  const { data: fuelEntriesData } = useCollection(fuelQuery);
  const fuelEntries = fuelEntriesData || [];

  // ── Firebase — service entries ──────────────────────────────────
  // PERF: Not needed on settings view — gate it off.
  const serviceQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedVehicleId || currentView === "settings")
      return null;
    return collection(
      firestore,
      "userProfiles",
      user.uid,
      "vehicles",
      selectedVehicleId,
      "serviceEntries",
    );
  }, [firestore, user?.uid, selectedVehicleId, currentView]);
  const { data: serviceEntriesData } = useCollection(serviceQuery);
  const serviceEntries = serviceEntriesData || [];

  // ── Firebase — reimbursement entries ───────────────────────────
  // PERF: Not needed on settings view.
  const reclaimQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedVehicleId || currentView === "settings")
      return null;
    return collection(
      firestore,
      "userProfiles",
      user.uid,
      "vehicles",
      selectedVehicleId,
      "reimbursementEntries",
    );
  }, [firestore, user?.uid, selectedVehicleId, currentView]);
  const { data: reclaimEntriesData } = useCollection(reclaimQuery);
  const reclaimEntries = reclaimEntriesData || [];

  // ── Firebase — tire pressure entries ───────────────────────────
  // PERF: Only used on the dashboard (alerts + health bar) — gate to dashboard only.
  const tireQuery = useMemoFirebase(() => {
    if (
      !firestore ||
      !user ||
      !selectedVehicleId ||
      currentView !== "dashboard"
    )
      return null;
    return collection(
      firestore,
      "userProfiles",
      user.uid,
      "vehicles",
      selectedVehicleId,
      "tirePressureEntries",
    );
  }, [firestore, user?.uid, selectedVehicleId, currentView]);
  const { data: tireEntriesData } = useCollection(tireQuery);
  const tireEntries = tireEntriesData || [];

  // ── Pre-sorted arrays (computed once, reused by all consumers) ──
  // Sorting is O(n log n) — do it once per data change, never per sub-consumer.
  const sortedFuelEntries = useMemo(
    () =>
      [...fuelEntries].sort(
        (a, b) => new Date(b.day).getTime() - new Date(a.day).getTime(),
      ),
    [fuelEntries],
  );
  const sortedServiceEntries = useMemo(
    () =>
      [...serviceEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [serviceEntries],
  );
  const sortedTireEntries = useMemo(
    () =>
      [...tireEntries].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [tireEntries],
  );

  // Stable date formatter — one Intl object reused across all chart label renders
  const shortDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }),
    [],
  );

  // ── Derived values ──────────────────────────────────────────────
  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) ?? null,
    [vehicles, selectedVehicleId],
  );

  // Health values — calculateHealth now receives pre-sorted arrays, no internal sorts
  const oilHealth = useMemo(
    () =>
      calculateHealth(
        sortedServiceEntries,
        "Oil Change",
        5000,
        sortedFuelEntries,
      ),
    [sortedServiceEntries, sortedFuelEntries],
  );
  const thrusterHealth = useMemo(
    () =>
      calculateHealth(
        sortedServiceEntries,
        "Tire Rotation",
        7500,
        sortedFuelEntries,
      ),
    [sortedServiceEntries, sortedFuelEntries],
  );

  const alerts = useMemo(() => {
    const list = [];
    if (!selectedVehicle) return list;

    if (oilHealth < 20) {
      list.push({
        id: "oil",
        title:
          oilHealth <= 0 ? "CRITICAL: CORE FAILURE" : "WARNING: LOW INTEGRITY",
        description: `Ship reactor health at ${oilHealth}%. Immediate docking required.`,
        variant: oilHealth <= 0 ? "destructive" : "warning",
      });
    }

    // sortedTireEntries is already sorted, newest first — no re-sort needed
    if (sortedTireEntries.length >= 1) {
      const latest = sortedTireEntries[0];
      const lowTires = [
        { name: "PF", val: latest.frontLeft },
        { name: "SF", val: latest.frontRight },
        { name: "PA", val: latest.rearLeft },
        { name: "SA", val: latest.rearRight },
      ].filter((p) => p.val < 28);
      if (lowTires.length > 0) {
        list.push({
          id: "tire-leak",
          title: "HULL PRESSURE BREACH",
          description: `Low pressure detected in: ${lowTires.map((t) => t.name).join(", ")}.`,
          variant: "destructive",
        });
      }
    }
    return list;
  }, [selectedVehicle, oilHealth, sortedTireEntries]);

  // ── Analytics memos ─────────────────────────────────────────────
  // PERF: Split into two separate memos so a change to fuelEntries does NOT
  // invalidate the service-side memos (and vice-versa). Avoids the cascading
  // re-compute that happened with a shared { fuel, service } object reference.
  const filteredFuel = useMemo(() => {
    if (analyticsRange === "all") return fuelEntries;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(analyticsRange));
    return fuelEntries.filter((e) => new Date(e.day) >= cutoff);
  }, [fuelEntries, analyticsRange]);

  const filteredService = useMemo(() => {
    if (analyticsRange === "all") return serviceEntries;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(analyticsRange));
    return serviceEntries.filter((e) => new Date(e.date) >= cutoff);
  }, [serviceEntries, analyticsRange]);

  const filteredReclaim = useMemo(() => {
    if (analyticsRange === "all") return reclaimEntries;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(analyticsRange));
    return reclaimEntries.filter((e) => new Date(e.day) >= cutoff);
  }, [reclaimEntries, analyticsRange]);

  const fuelEfficiencyData = useMemo(() => {
    const sorted = [...filteredFuel].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
    );
    return sorted
      .map((e) => ({
        // PERF: Reuse the stable Intl instance instead of creating a new one per entry
        date: shortDateFormatter.format(new Date(e.day)),
        mpg: calculateMPG(e, fuelEntries),
      }))
      .filter((item) => item.mpg > 0);
  }, [filteredFuel, fuelEntries, shortDateFormatter]);

  const maintenanceSpendData = useMemo(() => {
    const categories = {};
    filteredService.forEach((s) => {
      categories[s.serviceType] =
        (categories[s.serviceType] || 0) + s.totalCost;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [filteredService]);

  const reimbursementStats = useMemo(() => {
    const total = filteredFuel.reduce((sum, f) => sum + f.totalPrice, 0);
    const reimbursed = filteredReclaim.reduce((sum, r) => sum + r.amount, 0);
    return { total, reimbursed, net: total - reimbursed };
  }, [filteredFuel, filteredReclaim]);

  // ── Stable callbacks — theme & nav ──────────────────────────────
  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const navToDashboard = useCallback(() => setCurrentView("dashboard"), []);
  const navToLogs = useCallback(() => setCurrentView("logs"), []);
  const navToAnalytics = useCallback(() => setCurrentView("analytics"), []);
  const navToSettings = useCallback(() => setCurrentView("settings"), []);

  // ── Stable callbacks — selection & tabs ────────────────────────
  const handleSelectVehicle = useCallback((id) => setSelectedVehicleId(id), []);
  const handleSetActiveTab = useCallback((tab) => setActiveTab(tab), []);

  // ── Stable callbacks — modal open / close ──────────────────────
  const handleOpenNewVehicle = useCallback(() => setIsNewVehicleOpen(true), []);
  const handleCloseNewVehicle = useCallback(
    () => setIsNewVehicleOpen(false),
    [],
  );
  const handleOpenFuelLog = useCallback(() => setIsNewFuelLogOpen(true), []);
  const handleCloseFuelLog = useCallback(() => setIsNewFuelLogOpen(false), []);
  const handleOpenServiceLog = useCallback(
    () => setIsNewServiceLogOpen(true),
    [],
  );
  const handleCloseServiceLog = useCallback(
    () => setIsNewServiceLogOpen(false),
    [],
  );
  const handleOpenTireLog = useCallback(() => setIsNewTireLogOpen(true), []);
  const handleCloseTireLog = useCallback(() => setIsNewTireLogOpen(false), []);
  const handleOpenReclaim = useCallback(() => setIsNewReclaimOpen(true), []);
  const handleCloseReclaim = useCallback(() => setIsNewReclaimOpen(false), []);
  const handleToggleFab = useCallback(() => setIsMobileFabOpen((v) => !v), []);

  // ── Stable callbacks — auth & misc ─────────────────────────────
  const handleSignOut = useCallback(() => signOut(auth), [auth]);
  const handleChangeRange = useCallback(
    (e) => setAnalyticsRange(e.target.value),
    [],
  );
  const handleIsFull = useCallback((e) => setIsFull(e.target.checked), []);
  const handleIsReimbursable = useCallback(
    (e) => setIsReimbursable(e.target.checked),
    [],
  );

  // Mobile FAB shortcut actions (open modal + close FAB menu)
  const fabOpenFuel = useCallback(() => {
    setIsNewFuelLogOpen(true);
    setIsMobileFabOpen(false);
  }, []);
  const fabOpenService = useCallback(() => {
    setIsNewServiceLogOpen(true);
    setIsMobileFabOpen(false);
  }, []);
  const fabOpenReclaim = useCallback(() => {
    setIsNewReclaimOpen(true);
    setIsMobileFabOpen(false);
  }, []);
  const fabOpenVehicle = useCallback(() => {
    setIsNewVehicleOpen(true);
    setIsMobileFabOpen(false);
  }, []);

  // ── Ref to latest fuelEntries ───────────────────────────────────
  // PERF: Avoids adding fuelEntries to handleAddFuelLog's useCallback deps,
  // which would recreate the callback on every Firestore snapshot update.
  const fuelEntriesRef = useRef(fuelEntries);
  useEffect(() => {
    fuelEntriesRef.current = fuelEntries;
  }, [fuelEntries]);

  // ── Form submit handlers ────────────────────────────────────────
  const handleAddVehicle = useCallback(
    (e) => {
      e.preventDefault();
      if (!user || !firestore) return;
      const fd = new FormData(e.currentTarget);
      const make = String(fd.get("make") ?? "")
        .trim()
        .slice(0, 50);
      const model = String(fd.get("model") ?? "")
        .trim()
        .slice(0, 50);
      const year = parseInt(fd.get("year"));
      const name = String(fd.get("name") ?? "")
        .trim()
        .slice(0, 80);

      // ── Validation ──
      if (!make || !model) {
        toast({
          variant: "destructive",
          title: "Missing Fields",
          description: "Make and model are required.",
        });
        return;
      }
      if (
        !Number.isFinite(year) ||
        year < 1900 ||
        year > new Date().getFullYear() + 2
      ) {
        toast({
          variant: "destructive",
          title: "Invalid Year",
          description: "Enter a valid vehicle year.",
        });
        return;
      }

      // PERF/SEC: Use Firestore's auto-ID — collision-safe, hotspot-safe, no Math.random()
      const vehicleRef = doc(
        collection(firestore, "userProfiles", user.uid, "vehicles"),
      );
      const vehicleId = vehicleRef.id;
      const newVehicle = {
        id: vehicleId,
        make,
        model,
        sub_model: String(fd.get("sub_model") ?? "")
          .trim()
          .slice(0, 50),
        year,
        name: name || `${year} ${make} ${model}`,
      };
      setDocumentNonBlocking(
        vehicleRef,
        { ...newVehicle, createdAt: serverTimestamp() },
        { merge: true },
      );
      setSelectedVehicleId(vehicleId);
      setIsNewVehicleOpen(false);
      e.currentTarget.reset();
      toast({
        title: "SHIP REGISTERED",
        description: "Vessel signal locked in.",
      });
    },
    [user, firestore, toast],
  );

  const handleAddFuelLog = useCallback(
    (e) => {
      e.preventDefault();
      if (!user || !firestore || !selectedVehicleId) return;
      const fd = new FormData(e.currentTarget);
      const odo = parseInt(fd.get("odometer"));
      const qty = parseFloat(fd.get("quantity"));
      const day = fd.get("day");

      // ── Validation ──
      if (!Number.isFinite(odo) || odo < 0 || odo > 9_999_999) {
        toast({
          variant: "destructive",
          title: "Invalid Odometer",
          description: "Must be a number between 0 and 9,999,999.",
        });
        return;
      }
      if (!Number.isFinite(qty) || qty <= 0 || qty > 9_999) {
        toast({
          variant: "destructive",
          title: "Invalid Quantity",
          description: "Fuel quantity must be between 0 and 9,999.",
        });
        return;
      }
      if (!day) {
        toast({
          variant: "destructive",
          title: "Missing Date",
          description: "Please select a fill-up date.",
        });
        return;
      }

      const station = String(fd.get("gasStation") ?? "")
        .trim()
        .slice(0, 100);
      let totalPrice = parseFloat(fd.get("totalPrice"));
      let fuelPrice = parseFloat(fd.get("fuelPrice"));
      if (isNaN(fuelPrice) && !isNaN(totalPrice) && qty > 0)
        fuelPrice = Number((totalPrice / qty).toFixed(3));
      else if (isNaN(totalPrice) && !isNaN(fuelPrice) && qty > 0)
        totalPrice = Number((fuelPrice * qty).toFixed(2));

      // PERF: Read entries via ref — avoids fuelEntries in deps (callback stays stable)
      const mileage = calculateMPG(
        { odometer: odo, fuelQuantity: qty, isFull },
        fuelEntriesRef.current,
      );
      const colRef = collection(
        firestore,
        "userProfiles",
        user.uid,
        "vehicles",
        selectedVehicleId,
        "fuelEntries",
      );
      addDocumentNonBlocking(colRef, {
        vehicleId: selectedVehicleId,
        day,
        odometer: odo,
        fuelQuantity: qty,
        fuelPrice: fuelPrice || 0,
        totalPrice: totalPrice || 0,
        gasStation: station,
        isFull,
        mileage,
        createdAt: serverTimestamp(),
      });
      setIsNewFuelLogOpen(false);
      e.currentTarget.reset();
      toast({ title: "LOGGED", description: "Telemetry archived." });
    },
    [user, firestore, selectedVehicleId, isFull, toast],
  ); // fuelEntries intentionally removed — read via ref

  const handleAddServiceLog = useCallback(
    (e) => {
      e.preventDefault();
      if (!user || !firestore || !selectedVehicleId) return;
      const fd = new FormData(e.currentTarget);
      const cost = parseFloat(fd.get("cost"));
      const odo = parseInt(fd.get("odometer"));

      // ── Validation ──
      if (!Number.isFinite(cost) || cost < 0 || cost > 999_999) {
        toast({
          variant: "destructive",
          title: "Invalid Cost",
          description: "Cost must be a positive number up to 999,999.",
        });
        return;
      }
      if (!Number.isFinite(odo) || odo < 0 || odo > 9_999_999) {
        toast({
          variant: "destructive",
          title: "Invalid Odometer",
          description: "Must be between 0 and 9,999,999.",
        });
        return;
      }

      const rAmount = isReimbursable
        ? parseFloat(fd.get("reimbursementAmount")) || 0
        : 0;
      const colRef = collection(
        firestore,
        "userProfiles",
        user.uid,
        "vehicles",
        selectedVehicleId,
        "serviceEntries",
      );
      addDocumentNonBlocking(colRef, {
        vehicleId: selectedVehicleId,
        date: fd.get("date"),
        odometerReading: odo,
        serviceType: String(fd.get("serviceType") ?? "")
          .trim()
          .slice(0, 100),
        description: String(fd.get("description") ?? "")
          .trim()
          .slice(0, 500),
        totalCost: cost,
        provider: String(fd.get("provider") ?? "")
          .trim()
          .slice(0, 100),
        reimbursable: isReimbursable,
        reimbursementAmount: rAmount,
        createdAt: serverTimestamp(),
      });
      setIsNewServiceLogOpen(false);
      e.currentTarget.reset();
      toast({ title: "ARCHIVED", description: "Refit telemetry confirmed." });
    },
    [user, firestore, selectedVehicleId, isReimbursable, toast],
  );

  const handleAddReclaim = useCallback(
    (e) => {
      e.preventDefault();
      if (!user || !firestore || !selectedVehicleId) return;

      const fd = new FormData(e.currentTarget);
      const amount = parseFloat(fd.get("amount"));
      const day = fd.get("date");

      if (!Number.isFinite(amount) || amount <= 0 || amount > 999_999) {
        toast({
          variant: "destructive",
          title: "Invalid Amount",
          description: "Reclaim amount must be a positive number.",
        });
        return;
      }
      if (!day) return;

      const colRef = collection(
        firestore,
        "userProfiles",
        user.uid,
        "vehicles",
        selectedVehicleId,
        "reimbursementEntries",
      );
      addDocumentNonBlocking(colRef, {
        vehicleId: selectedVehicleId,
        day,
        amount,
        description: String(fd.get("description") ?? "")
          .trim()
          .slice(0, 500),
        createdAt: serverTimestamp(),
      });
      setIsNewReclaimOpen(false);
      e.currentTarget.reset();
      toast({
        title: "RECLAIM SAVED",
        description: "Berry deposit cataloged.",
      });
    },
    [user, firestore, selectedVehicleId, toast],
  );

  const handleAddTireLog = useCallback(
    (e) => {
      e.preventDefault();
      if (!user || !firestore || !selectedVehicleId) return;
      const fd = new FormData(e.currentTarget);
      const [fl, fr, rl, rr] = ["fl", "fr", "rl", "rr"].map((k) =>
        parseFloat(fd.get(k)),
      );

      // ── Validation ──
      if (
        [fl, fr, rl, rr].some((v) => !Number.isFinite(v) || v < 0 || v > 200)
      ) {
        toast({
          variant: "destructive",
          title: "Invalid PSI",
          description: "All tire readings must be between 0 and 200 PSI.",
        });
        return;
      }

      const colRef = collection(
        firestore,
        "userProfiles",
        user.uid,
        "vehicles",
        selectedVehicleId,
        "tirePressureEntries",
      );
      addDocumentNonBlocking(colRef, {
        vehicleId: selectedVehicleId,
        date: new Date().toISOString(),
        frontLeft: fl,
        frontRight: fr,
        rearLeft: rl,
        rearRight: rr,
        unit: "PSI",
        createdAt: serverTimestamp(),
      });
      setIsNewTireLogOpen(false);
      e.currentTarget.reset();
      toast({ title: "SYNCED", description: "Hull scan complete." });
    },
    [user, firestore, selectedVehicleId, toast],
  );

  const handleUpdateProfile = useCallback(
    async (e) => {
      e.preventDefault();
      if (isUpdating) return; // SEC: block double-submission spam
      // SEC: Guard against null currentUser if session expires between renders
      if (!auth.currentUser) {
        toast({
          variant: "destructive",
          title: "Not Authenticated",
          description: "Please sign in again.",
        });
        return;
      }
      const name = String(
        new FormData(e.currentTarget).get("displayName") ?? "",
      ).trim();
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
        await updateProfile(auth.currentUser, {
          displayName: name.slice(0, 100),
        });
        toast({ title: "SIGNAL UPDATED" });
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: err.message,
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [auth, toast, isUpdating],
  );

  const handleMigrateMPG = useCallback(async () => {
    if (!user || !firestore || !selectedVehicleId) return;
    try {
      const colRef = collection(
        firestore,
        "userProfiles",
        user.uid,
        "vehicles",
        selectedVehicleId,
        "fuelEntries",
      );
      const snapshot = await getDocs(colRef);

      const allEntries = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      let updatedCount = 0;
      let dbg = [];
      for (const entry of allEntries) {
        const correctMpg = calculateMPG(entry, allEntries);
        if (correctMpg !== entry.mileage) {
          const entryRef = doc(colRef, entry.id);
          await updateDoc(entryRef, { mileage: correctMpg });
          updatedCount++;
          if (dbg.length < 2)
            dbg.push(`${entry.day}: ${entry.mileage} -> ${correctMpg}`);
        }
      }

      if (updatedCount > 0) {
        toast({
          title: "CALIBRATION FINISHED",
          description: `Updated ${updatedCount} logs. e.g. ${dbg.join(", ")}`,
        });
      } else {
        toast({
          description: "All database logs are already perfectly calibrated.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Calibration Failed",
        description: err.message,
      });
    }
  }, [user, firestore, selectedVehicleId, toast]);

  // ── Return everything the shell needs ───────────────────────────
  const value = {
    // Auth / Firebase primitives
    user,
    isUserLoading,
    rootRef,

    // View & UI state
    currentView,
    selectedVehicleId,
    activeTab,
    analyticsRange,
    isDarkMode,
    isFull,
    isReimbursable,
    isUpdating,
    isNewVehicleOpen,
    isNewFuelLogOpen,
    isNewServiceLogOpen,
    isNewTireLogOpen,
    isNewReclaimOpen,
    isMobileFabOpen,

    // Data
    vehicles,
    fuelEntries,
    serviceEntries,
    tireEntries,
    reclaimEntries,
    selectedVehicle,
    oilHealth,
    thrusterHealth,
    alerts,
    fuelEfficiencyData,
    maintenanceSpendData,
    reimbursementStats,

    // Nav
    navToDashboard,
    navToLogs,
    navToAnalytics,
    navToSettings,

    // Selection / tab handlers
    handleSelectVehicle,
    handleSetActiveTab,

    // Modal handlers
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

    // FAB shortcuts
    fabOpenFuel,
    fabOpenService,
    fabOpenReclaim,
    fabOpenVehicle,

    // Form / misc handlers
    toggleTheme,
    handleSignOut,
    handleChangeRange,
    handleIsFull,
    handleIsReimbursable,
    handleAddVehicle,
    handleAddFuelLog,
    handleAddServiceLog,
    handleAddReclaim,
    handleAddTireLog,
    handleUpdateProfile,
    handleMigrateMPG,
  };

  return (
    <FuelTrackerContext.Provider value={value}>
      {children}
    </FuelTrackerContext.Provider>
  );
}

export function useFuelTracker() {
  const context = useContext(FuelTrackerContext);
  if (!context) {
    throw new Error("useFuelTracker must be used within a FuelTrackerProvider");
  }
  return context;
}
