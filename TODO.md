# TODO — Employee Monitoring Fixes (PC TRACKER)

## Phase 1: UI cleanup (no employeeId on cards)
- [ ] Remove Employee ID display from employee cards in `src/pages/Dashboard.jsx`
- [ ] Remove any Employee ID display from summary/drawer header in `src/components/AnalyticsDrawer.jsx`
- [ ] Remove summary preview UI blocks on cards; keep only `[Summary]` button to open drawer

## Phase 2: Monitoring status logic (heartbeat + keyboard/mouse)
- [ ] Add keyboard/mouse activity markers to agent writes into standardized fields
- [ ] Update React hooks to compute monitoringStatus from:
  - keyboard activity exists
  - mouse activity exists
  - heartbeat active
- [ ] Update admin dashboard text to show `Monitoring Active`/`Monitoring Inactive` based on computed status

## Phase 3: Firebase schema + realtime paths alignment (critical)
Standard schema/paths to align across agent + hooks + pages:
- [ ] Update agent Firestore writes to:
  - [ ] `users/{uid}/deviceStatus/{deviceId}`
  - [ ] `users/{uid}/sessions/{sessionId}`
  - [ ] `users/{uid}/activities/{deviceId}`
- [ ] Update `server/firebaseSync.js` and `server/monitor.js` to write standardized fields:
  - [ ] uid
  - [ ] employeeName
  - [ ] employeeId
  - [ ] deviceName
  - [ ] isOnline
  - [ ] lastSeen
  - [ ] currentApp
  - [ ] activeHours
  - [ ] productivity
- [ ] Update `src/hooks/useFirestoreData.js` to read new collections and join deviceStatus with user profiles

## Phase 4: All Devices page mapping fix
- [ ] Fix `src/pages/AllDevices.jsx` to correctly display:
  - Employee name
  - deviceName (hostname)
  - online status
  - currentApp
  - activeHours
  - productivity
- [ ] Ensure realtime sync uses the same schema and listeners as admin pages

## Phase 5: Auto-start / heartbeat reliability
- [ ] Ensure EXE auto-starts monitoring and begins heartbeat immediately
- [ ] Ensure heartbeat interval every 5 seconds updates `lastSeen` + `isOnline`
- [ ] Ensure admin flips to active instantly upon agent start

## Phase 6: Testing/verification
- [ ] Run locally: launch dashboard, start agent, confirm UI flips to Active
- [ ] Validate All Devices page data presence and correctness
- [ ] Validate summary drawer opens only on click and contains correct data

