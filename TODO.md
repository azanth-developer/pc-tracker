# TODO - Attendance mapping consistency fix

- [ ] Update `src/pages/Attendance.jsx` to stop rendering from raw `devices` alone.
- [ ] Load `users/` via `useUsers()` and `devices/` via `useDevices()`.
- [ ] Build `usersMap` keyed by `uid` (document id from `users`).
- [ ] While rendering table rows, resolve employee name/ID using `usersMap[record.uid]` (master profile source).
- [ ] Prefer `device.userId` / `device.id` as `uid` for mapping lookup.
- [ ] Verify no more `Unknown User` and employee IDs appear.
- [ ] Sanity check delete actions still use the correct `uid`.

