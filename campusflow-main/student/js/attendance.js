// student/js/attendance.js
import { db } from "../../js/firebase.js";
import { 
  doc, 
  getDoc, 
  addDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Helper to populate the event dropdown for the logged-in student
export async function loadAttendanceEventsSelect(currentUser) {
  const select = document.getElementById("attendanceEventSelect");
  if (!select) return;

  try {
    const q = query(
      collection(db, "registrations"), 
      where("studentUid", "==", currentUser.uid)
    );
    const snap = await getDocs(q);

    select.innerHTML = '<option value="">-- Choose Registered Event --</option>';

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.eventId && data.eventTitle) {
        const option = document.createElement("option");
        option.value = data.eventId;
        option.textContent = data.eventTitle;
        select.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error loading events for attendance:", error);
  }
}

// Attendance submission logic
export async function submitAttendance(currentUser) {
  const selectEl = document.getElementById("attendanceEventSelect");
  const codeInput = document.getElementById("attendanceCodeInput");

  const eventId = selectEl ? selectEl.value : "";
  const inputCode = codeInput ? codeInput.value.trim() : "";

  if (!eventId || !inputCode) {
    alert("Please select an event and enter the attendance code.");
    return;
  }

  try {
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      alert("Selected event not found.");
      return;
    }

    const eventData = eventSnap.data();

    const isActive = eventData.attendanceOpen === true || String(eventData.attendanceOpen).toLowerCase() === "true";
    if (!isActive) {
      alert("Attendance is not active for this event.");
      return;
    }

    if (String(eventData.attendanceCode).trim() !== inputCode) {
      alert("Invalid attendance code.");
      return;
    }

    const existingQ = query(
      collection(db, "attendance"),
      where("eventId", "==", eventId),
      where("studentUid", "==", currentUser.uid)
    );
    const existingSnap = await getDocs(existingQ);

    if (!existingSnap.empty) {
      alert("You have already submitted attendance for this event! 🟢");
      if (codeInput) codeInput.value = "";
      return;
    }

    // Record attendance entry
    await addDoc(collection(db, "attendance"), {
      eventId: eventId,
      eventTitle: eventData.title || eventData.eventName || "Event",
      studentUid: currentUser.uid,
      studentEmail: currentUser.email || "",
      markedAt: serverTimestamp()
    });

    // Automatically issue certificate record
    await addDoc(collection(db, "certificates"), {
      eventId: eventId,
      eventTitle: eventData.title || eventData.eventName || "Event",
      studentUid: currentUser.uid,
      studentName: currentUser.displayName || currentUser.email.split("@")[0],
      issuedAt: serverTimestamp()
    });

    alert("Attendance marked and Certificate unlocked! 🎉");
    if (codeInput) codeInput.value = "";

  } catch (error) {
    console.error("Error marking attendance:", error);
    alert("Failed to mark attendance.");
  }
}

// 💡 THIS EXPORT WAS MISSING OR MISNAMED IN YOUR ATTENDANCE.JS
export function initAttendanceForm(currentUser) {
  // Load events into dropdown
  loadAttendanceEventsSelect(currentUser);

  // Bind submit event
  const form = document.getElementById("attendanceForm");
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      await submitAttendance(currentUser);
    };
  }
}