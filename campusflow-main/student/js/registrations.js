import { db } from "../../js/firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export async function loadMyRegistrations(currentUser) {
  const container = document.getElementById("myRegistrationsContainer");
  if (!container) return;

  try {
    const q = query(collection(db, "registrations"), where("studentUid", "==", currentUser.uid));
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = "<p>No registrations found.</p>";
      return;
    }

    container.innerHTML = "";
    snap.forEach(docSnap => {
      const reg = docSnap.data();
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${reg.eventTitle}</h3>
        <p><strong>Regd. No:</strong> ${reg.registerNumber}</p>
        <p><span class="badge badge-success">Registered</span></p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Registrations error:", err);
  }
}