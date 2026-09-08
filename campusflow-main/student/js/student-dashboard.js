import { auth, db } from "../../js/firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Import modular features
import { loadApprovedEvents } from "./events.js";
import { loadMyRegistrations } from "./registrations.js";
import { loadAttendanceEventsSelect, initAttendanceForm } from "./attendance.js";
import { loadCertificates } from "./certificates.js";
import { loadNotifications } from "./notifications.js";

export let currentUser = null;
export let userProfile = null;

// Tab switcher & Event Binding
document.addEventListener("DOMContentLoaded", () => {
  const navButtons = document.querySelectorAll(".sidebar .nav-btn[data-tab]");
  const tabContents = document.querySelectorAll(".tab-content");

  navButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Clear active states
      navButtons.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.add("hidden"));

      // Set active button
      btn.classList.add("active");

      // Show target tab
      const targetId = btn.getAttribute("data-tab");
      const targetTab = document.getElementById(targetId);
      if (targetTab) {
        targetTab.classList.remove("hidden");
      }
    });
  });

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "../index.html";
  });
});

// Auth Guard
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  currentUser = user;
  const userDoc = await getDoc(doc(db, "users", user.uid));
  
  if (!userDoc.exists() || userDoc.data().role !== "student") {
    alert("Unauthorized access.");
    await signOut(auth);
    window.location.href = "../index.html";
    return;
  }

  userProfile = userDoc.data();

  // Initialize modular features
  loadApprovedEvents(currentUser, userProfile);
  loadMyRegistrations(currentUser);
  loadAttendanceEventsSelect(currentUser);
  initAttendanceForm(currentUser, userProfile);
  loadCertificates(currentUser);
  loadNotifications();
});