// js/services/certificateService.js
import { 
  db, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch, 
  doc, 
  serverTimestamp 
} from "../config/firebase.js";

const ATTENDANCE_COL = "attendance";
const CERTIFICATES_COL = "certificates";

export const certificateService = {
  // Bulk generate certificates for all attendees marked 'Present'
  async generateCertificatesForEvent(eventId) {
    // 1. Fetch present attendees
    const attQ = query(
      collection(db, ATTENDANCE_COL), 
      where("eventId", "==", eventId), 
      where("status", "==", "Present")
    );
    const attSnap = await getDocs(attQ);

    if (attSnap.empty) {
      throw new Error("No eligible 'Present' students found for this event.");
    }

    // 2. Fetch existing certificates to prevent duplicates
    const certQ = query(collection(db, CERTIFICATES_COL), where("eventId", "==", eventId));
    const certSnap = await getDocs(certQ);
    const existingStudentIds = new Set(certSnap.docs.map(d => d.data().studentId));

    const batch = writeBatch(db);
    let count = 0;

    attSnap.docs.forEach(attDoc => {
      const data = attDoc.data();
      if (!existingStudentIds.has(data.studentId)) {
        const certRef = doc(collection(db, CERTIFICATES_COL));
        batch.set(certRef, {
          certificateId: certRef.id,
          eventId: eventId,
          studentId: data.studentId,
          generatedAt: serverTimestamp(),
          certificateURL: `https://campusflow.internal/certificates/${certRef.id}.pdf` // Mock asset path
        });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
    return count; // Number of newly generated certificates
  }
};