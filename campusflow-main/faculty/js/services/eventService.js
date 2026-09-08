import { db } from "../../../js/firebase.js";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/**
 * GET EVENT REGISTRATIONS (Enhanced with student user profile lookup)
 */
export async function getEventRegistrations(eventId) {
  try {
    const q = query(collection(db, "registrations"), where("eventId", "==", eventId));
    const snapshot = await getDocs(q);
    
    const registrations = [];
    for (const docSnap of snapshot.docs) {
      const regData = docSnap.data();
      let studentName = regData.studentName || regData.fullName || "";
      
      // If name isn't stored directly in registration, try fetching it from the users collection
      if (!studentName && regData.studentUid) {
        try {
          const userDocRef = doc(db, "users", regData.studentUid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            studentName = userData.name || userData.fullName || userData.displayName || "";
          }
        } catch (e) {
          console.warn("Could not fetch user profile for name:", e);
        }
      }

      registrations.push({
        id: docSnap.id,
        ...regData,
        studentName: studentName || (regData.studentEmail ? regData.studentEmail.split("@")[0] : "Student")
      });
    }
    return registrations;
  } catch (err) {
    console.error("Error getting event registrations:", err);
    throw err;
  }
}

/**
 * 1. CREATE A NEW EVENT
 */
export async function createEvent(eventData, currentUser) {
  try {
    const docRef = await addDoc(collection(db, "events"), {
      title: eventData.title,
      description: eventData.description || "",
      venue: eventData.venue || "",
      startTime: eventData.startTime || "",
      endTime: eventData.endTime || "",
      registrationDeadline: eventData.registrationDeadline || "",
      maxParticipants: Number(eventData.maxParticipants) || 100,
      registeredCount: 0,
      
      facultyId: currentUser ? currentUser.uid : "",
      facultyEmail: currentUser ? currentUser.email : "",
      
      status: "pending", // Set to pending for approval workflow
      attendanceOpen: false,
      attendanceCode: null,
      
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

/**
 * 2. GET ALL EVENTS CREATED BY CURRENT FACULTY
 */
export async function getFacultyEvents(userOrUid) {
  try {
    const uid = typeof userOrUid === 'string' ? userOrUid : userOrUid?.uid;

    if (!uid) {
      console.warn("getFacultyEvents: No valid UID provided, returning empty array.");
      return [];
    }

    const q = query(
      collection(db, "events"), 
      where("facultyId", "==", uid)
    );
    const snap = await getDocs(q);

    const events = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      events.push({ 
        id: docSnap.id, 
        ...data,
        registeredCount: data.registeredStudents ? data.registeredStudents.length : (data.registeredCount || 0)
      });
    });

    return events;
  } catch (error) {
    console.error("Error fetching faculty events:", error);
    throw error;
  }
}

/**
 * 3. GET ALL PENDING EVENTS (FOR APPROVAL)
 */
export async function getPendingEvents() {
  try {
    const q = query(
      collection(db, "events"), 
      where("status", "==", "pending")
    );
    const snap = await getDocs(q);

    const events = [];
    snap.forEach((docSnap) => {
      events.push({ id: docSnap.id, ...docSnap.data() });
    });

    return events;
  } catch (error) {
    console.error("Error fetching pending events:", error);
    throw error;
  }
}

/**
 * 4. TOGGLE ATTENDANCE SESSION
 */
export async function toggleAttendance(eventId, isOpen, passcode = null) {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      attendanceOpen: isOpen,
      attendanceCode: isOpen ? String(passcode).trim() : null
    });

    return true;
  } catch (error) {
    console.error("Error toggling attendance:", error);
    throw error;
  }
}

/**
 * 5. ISSUE CERTIFICATES
 */
export async function issueCertificatesForEvent(eventId) {
  try {
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      throw new Error("Event not found.");
    }
    const eventData = eventSnap.data();

    const attQuery = query(
      collection(db, "attendance"), 
      where("eventId", "==", eventId)
    );
    const attSnap = await getDocs(attQuery);

    if (attSnap.empty) {
      throw new Error("No attendance records found for this event.");
    }

    const certQuery = query(
      collection(db, "certificates"),
      where("eventId", "==", eventId)
    );
    const certSnap = await getDocs(certQuery);
    const existingStudentUids = certSnap.docs.map(docSnap => docSnap.data().studentUid);

    let generatedCount = 0;

    for (const docSnap of attSnap.docs) {
      const attData = docSnap.data();

      if (existingStudentUids.includes(attData.studentUid)) {
        continue;
      }

      await addDoc(collection(db, "certificates"), {
        eventId: eventId,
        eventTitle: eventData.title || attData.eventTitle || "Event",
        studentUid: attData.studentUid,
        studentEmail: attData.studentEmail || "",
        studentName: attData.studentEmail ? attData.studentEmail.split("@")[0] : "Student",
        issuedAt: serverTimestamp()
      });

      generatedCount++;
    }

    return { success: true, count: generatedCount };
  } catch (error) {
    console.error("Certificate generation error:", error);
    throw error;
  }
}

/**
 * 6. DELETE EVENT
 */
export async function deleteEvent(eventId) {
  try {
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}

/**
 * 7. APPROVE A PENDING EVENT
 */
export async function approveEvent(eventId) {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      status: "Approved" // Matches your student-side query filter
    });
    return true;
  } catch (error) {
    console.error("Error approving event:", error);
    throw error;
  }
}