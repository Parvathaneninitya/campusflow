// js/services/attendanceService.js
import { db, doc, updateDoc, collection, query, where, getDocs } from "../config/firebase.js";

const EVENTS_COL = "events";
const ATTENDANCE_COL = "attendance";

export const attendanceService = {
  // Generate random 6-digit numeric code
  generate6DigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Open attendance session with a fresh code
  async startAttendance(eventId) {
    const code = this.generate6DigitCode();
    const eventRef = doc(db, EVENTS_COL, eventId);
    await updateDoc(eventRef, {
      attendanceOpen: true,
      attendanceCode: code
    });
    return code;
  },

  // Close active attendance session
  async stopAttendance(eventId) {
    const eventRef = doc(db, EVENTS_COL, eventId);
    await updateDoc(eventRef, {
      attendanceOpen: false,
      attendanceCode: ""
    });
  },

  // Fetch list of attendance records for an event
  async getAttendanceRecords(eventId) {
    const q = query(collection(db, ATTENDANCE_COL), where("eventId", "==", eventId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};