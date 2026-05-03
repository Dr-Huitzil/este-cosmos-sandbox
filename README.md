# Este Cosmos

**Fuel tracking and fleet logistics, built for the road and styled for deep space.**

Este Cosmos is a personal vehicle telemetry web application. It lets users track fuel fill-ups, vehicle maintenance, tire pressure, and reimbursable expenses across a multi-vehicle fleet — all backed by Firebase and wrapped in a neo-brutalist, space-themed interface.

---

<!-- SCREENSHOT: Landing page / auth screen — show the ESTE / COSMOS logotype on the star-field background -->

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Design System](#design-system)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [AI Anomaly Detection](#ai-anomaly-detection)
- [Views and Navigation](#views-and-navigation)
- [Modals and Forms](#modals-and-forms)
- [Authentication](#authentication)
- [Security](#security)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Dependencies](#dependencies)

---

## Overview

Este Cosmos tracks everything that happens to a vehicle between fill-ups. Each fuel log captures the odometer, gallons purchased, price, and fill station. The app calculates miles per gallon dynamically and, for authorized accounts, runs a WebAssembly-based anomaly detection model (Edge Impulse) on every new entry to flag efficiency degradation in real time.

The app is a single-page React application scaffolded with Vite. All user data lives in Firestore under a per-user path, isolated by Firestore Security Rules. There is no server-side rendering; the entire application runs in the browser.

---

## Features

- **Multi-vehicle fleet management** — register any number of vehicles with make, model, year, and a custom name.
- **Fuel logging** — record odometer, fuel quantity, price per unit or total price, fill station, and whether the tank was topped off.
- **Dynamic MPG calculation** — miles per gallon is computed from consecutive full-tank fill-ups. Partial fills are labelled accordingly and excluded from efficiency math.
- **Service log** — track oil changes, tire rotations, and any other maintenance events with cost, provider, odometer reading, and optional reimbursement amount.
- **Tire pressure log** — four-corner PSI snapshot (front-left, front-right, rear-left, rear-right) with automatic low-pressure alerts below 28 PSI.
- **Reclaim (reimbursement) log** — record commission or expense reimbursements received against fuel spend.
- **Analytics view** — line chart of efficiency over time (MPG) with an optional anomaly score overlay, a donut chart of maintenance spend by category, and a Berry Reclaim summary showing gross fuel spend, total reimbursed, and net cost.
- **Diagnostics sidebar** — engine oil health indicator and tire health indicator, both derived from service log history relative to configurable mileage thresholds.
- **Alert system** — inline warning banners when oil health drops below 20% or any tire reads below 28 PSI.
- **Dark / light theme** — full dual-mode support, persisted to `localStorage`, with automatic detection of system preference on first load.
- **AI anomaly detection** — gate-controlled, per-UID Edge Impulse WASM classifier that scores each fuel entry at log time.
- **Non-blocking writes** — all Firestore writes are fire-and-forget with a global error emitter surfacing failures as toast notifications.
- **Telemetry calibration** — a batch utility that recalculates and corrects historical MPG values across all fuel entries.
- **Responsive layout** — desktop sidebar + top bar; mobile bottom navigation bar + floating action button.

---

<!-- SCREENSHOT: Dashboard (Hangar) view — show the fleet cards, the tabbed log table, and the diagnostics sidebar -->

---

<!-- SCREENSHOT: Analytics (Systems) view — show the efficiency line chart and the maintenance spend donut chart -->

---

<!-- SCREENSHOT: Settings (Console) view — show the pilot identity card, visual filters toggle, and system maintenance section -->

---

## Design System

The visual language is **neo-brutalism** set inside a space-travel aesthetic. Every UI decision is deliberate: raw borders, hard shadows, and all-caps typography feel like a cockpit terminal; the color palette draws from sci-fi anime.

### Color Palette

All colors are defined as HSL triplets in CSS custom properties (`src/app/global.css`). The same token names are used in both light and dark mode; only the values change.

| Token | Light Mode | Dark Mode | Name / Purpose |
|---|---|---|---|
| `--primary` | `hsl(289 100% 54.1%)` | unchanged | **Espeon Pink** — main brand accent, buttons, active states, scrollbar thumb |
| `--secondary` | `hsl(199 100% 54.1%)` | unchanged | **Cyber Teal** — secondary accent, `COSMOS` wordmark, dark-mode borders and shadows |
| `--background` | `hsl(180 20% 95%)` | `hsl(250 20% 10%)` | Page background — light cyan wash / deep navy |
| `--foreground` | `hsl(250 20% 15%)` | `hsl(180 20% 95%)` | Text and borders — near-black blue tint / light cyan-white |
| `--card` | `hsl(0 0% 100%)` | `hsl(250 20% 12%)` | Card surfaces — pure white / slightly lighter than navy |
| `--muted` | `hsl(187 20% 90%)` | `hsl(250 20% 20%)` | Subdued fills — light teal wash / dark muted surface |
| `--destructive` | `hsl(0 84.2% 60.2%)` | `hsl(0 62.8% 30.6%)` | Error red — for alerts, invalid states |
| `--third` | `hsl(19 100% 54.1%)` | — | Orange — reserved for warnings |

**Anomaly indicator colors (inline):**
- Score below threshold: `#10b981` (green — healthy)
- Score at or above threshold: `#ef4444` (red — degradation)
- Theme toggle icon: `#ffcc00` (sun / light mode) · `#a78bfa` (moon / dark mode)

### Typography

- **Font family:** `Inter` (Google Fonts), falling back to `system-ui`, `-apple-system`, `sans-serif`.
- **Weight:** The UI makes heavy use of `font-weight: 900`. Labels, titles, buttons, and nav items are all ultra-bold.
- **Text transform:** Nearly all UI text is `text-transform: uppercase`.
- **Letter spacing:** Most labels use tight negative tracking (`letter-spacing: -0.05em`) on large display text, and wide positive tracking (`letter-spacing: 0.3–0.5em`) on small label text.
- **Font style:** View titles and brand wordmarks use `font-style: italic`.

### Shape Language

- **Border radius:** `0rem` globally. Every box is a hard rectangle with no rounding.
- **Borders:** `4px solid` everywhere. Cards, inputs, buttons, modals, and the sidebar all share the same stroke weight.
- **Shadows:** `8px 8px 0px rgba(0,0,0,1)` — hard offset, no blur. Cards appear to physically lift off the page. Buttons use `4px 4px 0px` and collapse to `0` on `:active` with a `translate(2px, 2px)` shift, simulating a physical press.
- **Dark mode shadows:** Card and button shadows switch from black to `hsl(var(--secondary))` (Cyber Teal) in dark mode.

### Texture

Two layered background effects reinforce the retro terminal feel:

1. **Scanlines** — `linear-gradient` alternating transparent / 4% black every 4px vertically.
2. **Dot grid** — inline SVG halftone pattern (1px circles at 20px intervals, 5% opacity) fixed to the viewport.

The `COSMOS` wordmark and some title accents apply a **halftone overlay** directly to the text itself using `background-image: radial-gradient` clipped to the letters.

### Component Patterns

- **`.retroCard`** — white/navy card with 4px border and 8px hard shadow. Shared across all views and modals.
- **`.retroBtn`** — thick-bordered button with press animation. Primary, secondary, and dark variants override the background color.
- **`.input` / `.select` / `.textarea`** — muted fill, 4px border, 4px shadow. Border color shifts to `--primary` on `:focus`.

---

## Architecture

```
src/
├── app/                    # Entry point, global CSS, root component
│   ├── App.jsx
│   ├── main.jsx
│   └── global.css          # Design tokens + base styles
├── EsteCosmos/             # Feature module — the full application widget
│   ├── esteCosmos.jsx      # Shell: layout, sidebar, top bar, bottom nav, modal gates
│   ├── esteCosmos.module.css
│   ├── views/              # Four full-page views
│   │   ├── authScreen.jsx / .css
│   │   ├── dashboardView.jsx / .css
│   │   ├── analyticsView.jsx / .css
│   │   ├── logsView.jsx / .css
│   │   └── settingsView.jsx / .css
│   ├── components/         # Reusable sub-components
│   │   ├── vehicleCard
│   │   ├── fuelLogTable
│   │   ├── serviceLogTable
│   │   ├── reclaimLogTable
│   │   ├── diagnosticsPanel
│   │   └── navItem
│   └── modals/             # Five modal dialogs
│       ├── vehicleModal
│       ├── fuelLogModal
│       ├── serviceLogModal
│       ├── tireLogModal
│       └── reclaimModal
├── contexts/               # Global state via React Context
│   ├── FleetContext.jsx    # Vehicle and log CRUD, AI scoring, isAiAuthorized
│   ├── AnalyticsContext.jsx # Derived chart data, health scores, alerts
│   ├── UIContext.jsx       # Navigation, modals, theme, auth actions
│   └── ProviderStack.jsx   # Composes all providers in order
├── firebase/               # Firebase SDK wrappers
│   ├── config.js
│   ├── index.js
│   ├── provider.jsx
│   ├── non-blocking-updates.jsx
│   ├── non-blocking-login.jsx
│   ├── error-emitter.js
│   ├── errors.js
│   └── firestore/
│       ├── use-collection.jsx
│       └── use-doc.jsx
├── hooks/
│   └── use-toast.jsx
├── ui/
│   └── toaster.jsx
└── util/
    ├── fuel-utils.js       # calculateMPG, calculateHealth, formatCurrency, parseLocalDate
    ├── ai-model.js         # runEdgeImpulseClassifier — loads and runs the WASM model
    └── constants.js        # DATE_RANGES
```

### Context Layer

The application uses three React Contexts composed in `ProviderStack`:

| Context | Responsibility |
|---|---|
| `UIContext` | Active view, open modals, dark mode, theme toggle, sign-out, profile update |
| `FleetContext` | Firestore collections (vehicles, fuel, service, tire, reclaim), all CRUD handlers, AI scoring, `isAiAuthorized` gate |
| `AnalyticsContext` | Derived data: chart series, health percentages, alert list, reimbursement totals |

All data flows downward. `AnalyticsContext` consumes `FleetContext`; views consume one or more contexts. `FleetContext` is the only context that writes to Firestore.

---

## Data Model

All data is stored in Firestore under `userProfiles/{userId}/`. Each user has fully isolated data enforced at the security rule level.

### vehicles `{vehicleId}`

| Field | Type | Notes |
|---|---|---|
| `id` | string | Firestore document ID |
| `make` | string | Max 50 chars |
| `model` | string | Max 50 chars |
| `year` | number | 1900 – current year + 2 |
| `name` | string | Display name, max 80 chars; defaults to `"YYYY Make Model"` |
| `createdAt` | timestamp | Server timestamp |

### vehicles/{vehicleId}/fuelEntries `{entryId}`

| Field | Type | Notes |
|---|---|---|
| `vehicleId` | string | Parent vehicle ID |
| `day` | string | Fill-up date, `YYYY-MM-DD` |
| `odometer` | number | 0 – 9,999,999 |
| `fuelQuantity` | number | Gallons, 0 – 9,999 |
| `fuelPrice` | number | Price per unit (derived if not provided) |
| `totalPrice` | number | Total spend (derived if not provided) |
| `gasStation` | string | Optional, max 100 chars |
| `isFull` | boolean | Whether this was a full-tank fill-up |
| `mileage` | number | Stored MPG at write time (recalculated by calibration) |
| `anomalyScore` | number \| null | Edge Impulse score, or `null` if AI is not authorized |
| `createdAt` | timestamp | Server timestamp |

### vehicles/{vehicleId}/serviceEntries `{entryId}`

| Field | Type | Notes |
|---|---|---|
| `vehicleId` | string | |
| `date` | string | Service date |
| `odometerReading` | number | 0 – 9,999,999 |
| `serviceType` | string | e.g. "Oil Change", "Tire Rotation" |
| `description` | string | Max 500 chars |
| `totalCost` | number | 0 – 999,999 |
| `provider` | string | Max 100 chars |
| `reimbursable` | boolean | |
| `reimbursementAmount` | number | |
| `createdAt` | timestamp | |

### vehicles/{vehicleId}/tirePressureEntries `{entryId}`

| Field | Type | Notes |
|---|---|---|
| `vehicleId` | string | |
| `date` | string | ISO timestamp |
| `frontLeft` | number | PSI, 0 – 200 |
| `frontRight` | number | PSI, 0 – 200 |
| `rearLeft` | number | PSI, 0 – 200 |
| `rearRight` | number | PSI, 0 – 200 |
| `unit` | string | Always `"PSI"` |
| `createdAt` | timestamp | |

### vehicles/{vehicleId}/reclaimEntries `{entryId}`

| Field | Type | Notes |
|---|---|---|
| `vehicleId` | string | |
| `day` | string | `YYYY-MM-DD` |
| `amount` | number | 0 – 99,999 |
| `description` | string | Max 500 chars |
| `createdAt` | timestamp | |

---

## AI Anomaly Detection

Este Cosmos includes an optional AI layer powered by an **Edge Impulse** anomaly detection model compiled to WebAssembly.

The model is gated: only users whose Firebase UID matches the value of `VITE_AI_AUTHORIZED_UID` in the environment can activate it. This check is performed in `FleetContext` via `isAiAuthorized`. When the gate is closed, `anomalyScore` is stored as `null` and no AI-related UI is shown.

### How it works

When an authorized user submits a fuel log, three features are extracted and passed to the classifier in alphabetical order (matching the model's expected input schema):

1. `fuelQuantity` — gallons purchased
2. `miles_per_day` — miles driven since the previous log divided by days elapsed (minimum 1 day to avoid division by zero)
3. `mpg` — miles per gallon calculated from the current and previous odometer readings

```
features = [fuelQuantity, miles_per_day, mpg]
anomalyScore = runEdgeImpulseClassifier(features).anomaly
```

The raw score is stored on the fuel entry document. A toast notification is shown immediately:
- Score below threshold: "Engine Optimal"
- Score at or above threshold: "Efficiency Degradation"

In the fuel log table, each entry shows a green check (`#10b981`) or red triangle (`#ef4444`) icon based on the stored score.

In the Analytics chart, a second Y-axis overlays the anomaly score as a red line alongside the MPG line.

The settings view shows a "Neural Link Active" status card when the AI is enabled. Users with 100 or more fuel log entries who are not yet authorized see a "Neural Uplink Available" upsell card prompting them to request access.

---

## Views and Navigation

Navigation state is managed by `UIContext`. On desktop, a sidebar is always visible. On mobile, a fixed bottom navigation bar replaces it. The active view is stored as a string: `dashboard`, `logs`, `analytics`, or `settings`.

### HANGAR (Dashboard)

The main operational hub. Shows:
- A scrollable fleet of vehicle cards, each displaying the vehicle name and most recent MPG.
- An "Enlist Vehicle" button.
- A tabbed detail panel for the selected vehicle with Fuel, Maintenance, and Tire sub-tabs.
- A diagnostics sidebar with oil health, tire health, and the latest four-corner PSI reading.
- Alert banners for low oil health or low tire pressure.

### BLACKBOX (Logs)

A simplified read-only view listing all fuel log entries for quick reference.

<!-- SCREENSHOT: Blackbox (Logs) view -->

### SYSTEMS (Analytics)

Charts and financial summaries:
- **Efficiency Propagation** — line chart of MPG over the selected date range. For authorized users, a second red line overlays the anomaly score.
- **Credit Allocation** — donut chart breaking down maintenance spend by service type category.
- **Berry Reclaim** — text summary of gross fuel expenditure, total commission reclaim, and net void loss.

Date range filter options: 14 days, 30 days, 90 days, 1 year, all time.

### CONSOLE (Settings)

- **User Identity** — display name editor backed by Firebase Auth `updateProfile`.
- **Visual Filters** — dark mode toggle ("Night Watch Mode").
- **Neural Uplink** — shows current AI access status; surfaces a request prompt when a user qualifies but is not yet authorized.
- **System Maintenance** — runs the MPG calibration batch (recalculates historical MPG for all fuel entries of the selected vehicle).
- **Leave Station** — signs the user out via Firebase Auth.

---

## Modals and Forms

All data entry happens through modal overlays. Modals are mounted conditionally in `esteCosmos.jsx` and controlled by boolean state in `UIContext`. Each modal is a full-screen overlay (`position: fixed`, `z-index: 50`) with a centered card (`max-width: 28rem`).

| Modal | Trigger | Fields |
|---|---|---|
| Enlist Vehicle | "ENLIST VEHICLE" button | Make, Model, Year, Custom Name |
| Log Fuel (Refuel) | "REFUEL" button or FAB | Date, Odometer, Quantity, Total Price or Price/Unit, Station, Full Tank checkbox, Reimbursable checkbox |
| Log Service | FAB > "LOG SERVICE" | Date, Service Type, Odometer, Cost, Provider, Description, Reimbursable flag + Amount |
| Log Tire | FAB > (from dashboard) | Four PSI fields (FL, FR, RL, RR) |
| Log Reclaim | FAB > "LOG RECLAIM" | Date, Amount, Description |

The floating action button (FAB) on mobile is a circular `+` button that expands into a stacked menu of these actions. On desktop, the same menu appears from the `+` icon button in the top bar.

<!-- SCREENSHOT: FAB menu open on mobile showing LOG FUEL, LOG SERVICE, ENLIST VEHICLE, LOG RECLAIM -->

<!-- SCREENSHOT: Fuel log modal open -->

---

## Authentication

Authentication is handled by Firebase Auth with email and password only. Anonymous sign-in is implemented in the codebase but commented out.

The auth screen (`authScreen.jsx`) presents two tabs:
- **Link** — sign in with existing credentials
- **Enlist** — create a new account

A "Forgot Access Codes?" flow triggers `sendPasswordResetEmail` and returns the user to the login tab on success.

The auth screen background uses a star field image (`src/assets/images/stars.jpg`) with a scanline overlay.

While Firebase checks the session state on load, a full-screen loading spinner is shown with the text "Syncing Network..." and a pulsing animation.

---

## Security

### Firestore Rules

```
match /userProfiles/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

Every read and write is rejected unless the requesting user's UID matches the document path segment. No user can access another user's data. There are no public collections.

### Input Validation

All form inputs are validated in the handler before any Firestore write:

- Odometer: integer, 0 – 9,999,999
- Fuel quantity: float, 0 – 9,999
- Service cost: float, 0 – 999,999
- Tire PSI: float, 0 – 200 per corner
- Reclaim amount: float, 0 – 99,999
- Vehicle year: integer, 1900 – current year + 2
- String fields are trimmed and capped at character limits (50–500 chars depending on field)

### AI Authorization

The AI feature is locked to a single Firebase UID stored as an environment variable (`VITE_AI_AUTHORIZED_UID`). The check is performed on the client at runtime. This is a feature gate, not a security boundary — the WASM model runs in the browser and Firestore rules protect the data regardless.

### Non-Blocking Writes and Error Handling

Firestore writes use fire-and-forget helper functions (`addDocumentNonBlocking`, `setDocumentNonBlocking`, `updateDocumentNonBlocking`). Any write failure is caught asynchronously and emitted via a global `errorEmitter` event bus. `UIContext` listens to `permission-error` events and surfaces them as destructive toast notifications.

---

## Environment Variables

Create a `.env.local` file in the project root (git-ignored):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Optional: Firebase UID of the account authorized to use AI anomaly detection
VITE_AI_AUTHORIZED_UID=
```

All variables are prefixed with `VITE_` to be exposed by Vite to the browser bundle. The Firebase initialization logic first attempts automatic initialization (for Firebase App Hosting environments), then falls back to the `firebaseConfig` object populated from these variables.

---

## Getting Started

**Prerequisites:** Node.js 18+, npm.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs on `http://localhost:5173` by default (Vite's default port).

You must have a Firebase project configured with:
- **Firebase Authentication** (Email/Password provider enabled)
- **Cloud Firestore** (in production or test mode, with the security rules above applied)

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the source |

---

## Dependencies

### Runtime

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.4 | UI framework |
| `react-dom` | ^19.2.4 | DOM renderer |
| `firebase` | ^12.12.0 | Firestore, Firebase Auth |
| `recharts` | ^3.8.1 | Line chart, pie chart in the Analytics view |
| `lucide-react` | ^1.8.0 | Icon set (Rocket, Zap, Wrench, AlertTriangle, etc.) |
| `date-fns` | ^4.1.0 | Date formatting and parsing utilities |

### Development

| Package | Version | Purpose |
|---|---|---|
| `vite` | ^8.0.10 | Build tool and dev server |
| `@vitejs/plugin-react` | ^6.0.1 | React fast refresh + JSX transform |
| `eslint` | ^9.39.4 | Linting |
| `eslint-plugin-react-hooks` | ^7.0.1 | Hook rules enforcement |
| `eslint-plugin-react-refresh` | ^0.5.2 | Fast refresh lint rules |

---

*Floating through the emptiness of space.*
