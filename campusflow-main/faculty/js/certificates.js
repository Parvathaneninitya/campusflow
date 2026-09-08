// certificates.js (located in the same directory as dashboard.js)
import { db } from "./config/firebase.js"; // adjust relative path to firebase if needed
import { 
  collection, query, where, getDocs 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export async function initCertificateManager(currentUser) {
  const select = document.getElementById("cert-event-select");
  const generateBtn = document.getElementById("generate-cert-btn");
  const statusMsg = document.getElementById("cert-status-msg");

  if (!select) return;

  try {
    // Fetch approved events for faculty
    const q = query(
      collection(db, "events"),
      where("createdBy", "==", currentUser.uid),
      where("certificateEnabled", "==", true)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      select.innerHTML = '<option value="">-- No Events with Certificates Enabled --</option>';
      if (generateBtn) generateBtn.disabled = true;
      return;
    }

    select.innerHTML = '<option value="">-- Select Event --</option>' + 
      snap.docs.map(doc => `<option value="${doc.id}">${doc.data().title}</option>`).join("");

  } catch (err) {
    console.error("Error initializing certificate manager:", err);
  }

  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      const eventId = select.value;
      if (!eventId) return alert("Please select an event.");
      
      if (statusMsg) {
        statusMsg.style.color = "#10b981";
        statusMsg.textContent = "Certificates are automatically made available to present students in their portal!";
      }
    });
  }
}