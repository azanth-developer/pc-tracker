import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Centralized utility to delete all data related to an employee.
 * Handles primary documents (users, devices) and associated telemetry.
 * 
 * @param {Object} params
 * @param {string} params.uid - The user's ID
 * @param {string} params.deviceId - The device's ID
 * @returns {Promise<void>}
 */
export async function deleteEmployeeCompletely({ uid, deviceId }) {
  console.log(`[FirebaseUtils] Deleting employee: UID=${uid}, DeviceID=${deviceId}`);
  
  const batch = writeBatch(db);
  
  // 1. Primary Documents (Simple Deletes)
  const simpleDocs = [
    { coll: "users", id: uid },
    { coll: "devices", id: deviceId },
    { coll: "runningApps", id: deviceId },
    { coll: "systemStats", id: deviceId },
    { coll: "activities", id: deviceId },
  ];

  simpleDocs.forEach(({ coll, id }) => {
    if (id) {
      batch.delete(doc(db, coll, id));
    }
  });

  // 2. Collections requiring queries (Sessions)
  // Note: For large datasets, this should be done via Cloud Functions
  // but for a dashboard client, we can do a limited cleanup.
  if (deviceId || uid) {
    try {
      const sessionsQuery = query(
        collection(db, "sessions"),
        where(deviceId ? "deviceId" : "uid", "==", deviceId || uid)
      );
      const sessionSnaps = await getDocs(sessionsQuery);
      sessionSnaps.forEach((d) => batch.delete(d.ref));
    } catch (err) {
      console.warn("[FirebaseUtils] Could not cleanup sessions:", err.message);
    }
  }

  // Commit all deletes
  return await batch.commit();
}
