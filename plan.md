The issue is that `FleetContext.jsx` has a very high complexity, combining the loading of 5 collections from Firebase (vehicles, fuelEntries, serviceEntries, tireEntries, reclaimEntries) and containing massive callback logic for creating documents (handleAddVehicle, handleAddFuelLog, handleAddServiceLog, handleAddTireLog, handleAddReclaim, handleMigrateMPG).

This causes re-renders and poor maintainability as one single file holds the whole state and business logic for many different models.

My plan is to split the large `FleetProvider` component into custom hooks.
Instead of splitting the Provider context, I will split the data fetching and mutation logic into smaller custom hooks that `FleetProvider` will combine to build its `contextValue`.

We will create a file for each logic group:
`src/hooks/fleet/useVehicles.js`
`src/hooks/fleet/useFuel.js`
`src/hooks/fleet/useService.js`
`src/hooks/fleet/useTire.js`
`src/hooks/fleet/useReclaim.js`

1. Create hooks in `src/hooks/fleet/` that extract logic from `FleetContext.jsx`
   - `useVehicles.js`: Fetches vehicles and handles selectedVehicleId and handleAddVehicle.
   - `useFuel.js`: Fetches fuelEntries and handles handleAddFuelLog and handleMigrateMPG.
   - `useService.js`: Fetches serviceEntries and handles handleAddServiceLog.
   - `useTire.js`: Fetches tireEntries and handles handleAddTireLog.
   - `useReclaim.js`: Fetches reclaimEntries and handles handleAddReclaim.

2. Refactor `FleetContext.jsx`:
   - Import the custom hooks.
   - Use the custom hooks to get the required variables and callbacks.
   - Pass them all into the `contextValue`.

3. Update dependencies if necessary to make sure `useFuel` gets `isFull`, `useService` gets `isReimbursable`, etc.

Wait, looking closely at how `handleAddFuelLog` works, it needs `toast`, `user`, `firestore`, `selectedVehicleId`, `isFull`, `handleCloseFuelLog`, `isAiAuthorized`.
I will pass these as arguments to the hooks or simply move all of the state to the hooks.

Let's do this by making `FleetContext.jsx` cleaner.
