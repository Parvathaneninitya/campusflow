import { db } from "../../js/firebase.js";
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export async function loadNotifications() {
  const container = document.getElementById("notificationsContainer");
  if (!container) return;

  const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  if (snap.empty) {
    container.innerHTML = "<p>No announcements.</p>";
    return;
  }

  container.innerHTML = "";
  snap.forEach(docSnap => {
    const notif = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h4>${notif.title || "Announcement"}</h4><p>${notif.message || ""}</p>`;
    container.appendChild(card);
  });
}